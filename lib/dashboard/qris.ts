// Pembuat kode QR (ISO/IEC 18004) dan payload QRIS (standar EMVCo QR / QRIS Bank Indonesia).
// Tidak membutuhkan library tambahan.
//
// Saat backend siap, string payload QRIS dinamis sebaiknya dikirim oleh payment gateway.
// Cukup berikan string tersebut ke `buildQrMatrix()`; tampilan di NutriAssist tidak perlu diubah.

/* ============================================================
 *  1. PAYLOAD QRIS (EMV Merchant-Presented Mode)
 * ============================================================ */

/** Data merchant platform. Ganti dengan data resmi dari penyedia pembayaran. */
export const QRIS_MERCHANT = {
  name: "NUTRIMATE AI",
  city: "JAKARTA",
  postalCode: "10110",
  nmid: "ID2026000000001",
  mcc: "8398", // Charitable and Social Service Organizations
} as const;

function tlv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) sesuai spesifikasi QRIS */
function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildQrisPayload(amount: number, reference: string): string {
  const m = QRIS_MERCHANT;
  const body =
    tlv("00", "01") + // versi payload
    tlv("01", "12") + // 12 = QRIS dinamis (nominal sudah ditentukan)
    tlv("51", tlv("00", "ID.CO.QRIS.WWW") + tlv("02", m.nmid) + tlv("03", "UMI")) +
    tlv("52", m.mcc) +
    tlv("53", "360") + // IDR
    tlv("54", String(Math.max(0, Math.round(amount)))) +
    tlv("58", "ID") +
    tlv("59", m.name) +
    tlv("60", m.city) +
    tlv("61", m.postalCode) +
    tlv("62", tlv("01", reference.slice(0, 25))) +
    "6304";
  return body + crc16(body);
}

/* ============================================================
 *  2. GENERATOR KODE QR (mode byte, versi 1-15)
 * ============================================================ */

export type QrEcc = "L" | "M" | "Q" | "H";

const ECC_INDEX: Record<QrEcc, number> = { L: 0, M: 1, Q: 2, H: 3 };
const ECC_FORMAT_BITS: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };
const MAX_VERSION = 15;

// Indeks = nomor versi (1-15); baris tiap tingkat koreksi berurutan: L, M, Q, H
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24],
];
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18],
];

function numRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function numDataCodewords(ver: number, ecc: QrEcc): number {
  const e = ECC_INDEX[ecc];
  return (
    Math.floor(numRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[e][ver] * NUM_ERROR_CORRECTION_BLOCKS[e][ver]
  );
}

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsGenerator(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], generator: number[]): number[] {
  const result: number[] = new Array(generator.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    generator.forEach((coef, i) => {
      result[i] ^= gfMultiply(coef, factor);
    });
  }
  return result;
}

function toUtf8Bytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function appendBits(buf: number[], value: number, len: number) {
  for (let i = len - 1; i >= 0; i--) buf.push((value >>> i) & 1);
}

function encodeCodewords(bytes: number[], ecc: QrEcc): { ver: number; data: number[] } {
  let ver = 1;
  let bits: number[] = [];
  for (; ver <= MAX_VERSION; ver++) {
    bits = [];
    appendBits(bits, 0x4, 4); // mode byte
    appendBits(bits, bytes.length, ver <= 9 ? 8 : 16);
    for (const b of bytes) appendBits(bits, b, 8);
    if (bits.length <= numDataCodewords(ver, ecc) * 8) break;
  }
  if (ver > MAX_VERSION) throw new Error("Data terlalu panjang untuk kode QR");

  const capacityBits = numDataCodewords(ver, ecc) * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) appendBits(bits, pad, 8);

  const data: number[] = new Array(bits.length / 8).fill(0);
  bits.forEach((b, i) => {
    data[i >>> 3] |= b << (7 - (i & 7));
  });
  return { ver, data };
}

function addEccAndInterleave(data: number[], ver: number, ecc: QrEcc): number[] {
  const e = ECC_INDEX[ecc];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[e][ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[e][ver];
  const rawCodewords = Math.floor(numRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const gen = rsGenerator(blockEccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const len = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + len);
    k += len;
    const ec = rsRemainder(dat, gen);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ec));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

function alignmentPositions(ver: number, size: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

class QrBuilder {
  readonly size: number;
  modules: boolean[][];
  isFunction: boolean[][];

  constructor(readonly ver: number, readonly ecc: QrEcc, codewords: number[]) {
    this.size = ver * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.drawFunctionPatterns();
    this.drawCodewords(codewords);

    let bestMask = 0;
    let bestPenalty = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      this.applyMask(mask);
      this.drawFormatBits(mask);
      const p = this.penalty();
      if (p < bestPenalty) {
        bestPenalty = p;
        bestMask = mask;
      }
      this.applyMask(mask); // XOR kedua = kembali ke semula
    }
    this.applyMask(bestMask);
    this.drawFormatBits(bestMask);
    this.isFunction = [];
  }

  private set(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.isFunction[y][x] = true;
  }

  private drawFunctionPatterns() {
    const { size, ver } = this;
    for (let i = 0; i < size; i++) {
      this.set(6, i, i % 2 === 0);
      this.set(i, 6, i % 2 === 0);
    }
    this.drawFinder(3, 3);
    this.drawFinder(size - 4, 3);
    this.drawFinder(3, size - 4);

    const pos = alignmentPositions(ver, size);
    const n = pos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        this.drawAlignment(pos[i], pos[j]);
      }
    }
    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFinder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) this.set(x, y, dist !== 2 && dist !== 4);
      }
    }
  }

  private drawAlignment(cx: number, cy: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) this.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }

  private drawFormatBits(mask: number) {
    const { size } = this;
    const data = (ECC_FORMAT_BITS[this.ecc] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) !== 0;

    for (let i = 0; i <= 5; i++) this.set(8, i, bit(i));
    this.set(8, 7, bit(6));
    this.set(8, 8, bit(7));
    this.set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) this.set(14 - i, 8, bit(i));

    for (let i = 0; i < 8; i++) this.set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) this.set(8, size - 15 + i, bit(i));
    this.set(8, size - 8, true);
  }

  private drawVersion() {
    if (this.ver < 7) return;
    let rem = this.ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.set(a, b, dark);
      this.set(b, a, dark);
    }
  }

  private drawCodewords(data: number[]) {
    const { size } = this;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  private applyMask(mask: number) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert = false;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
      }
    }
  }

  /** Penalti sederhana: deret warna sama, blok 2x2, dan keseimbangan modul gelap */
  private penalty(): number {
    const { size, modules: m } = this;
    let result = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let a = 0; a < size; a++) {
        let run = 1;
        for (let b = 1; b < size; b++) {
          const cur = pass === 0 ? m[a][b] : m[b][a];
          const prev = pass === 0 ? m[a][b - 1] : m[b - 1][a];
          if (cur === prev) {
            run++;
            if (run === 5) result += 3;
            else if (run > 5) result += 1;
          } else run = 1;
        }
      }
    }
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) result += 3;
      }
    }
    let dark = 0;
    for (const row of m) for (const c of row) if (c) dark++;
    const total = size * size;
    result += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
    return result;
  }
}

/** Menghasilkan matriks modul kode QR (true = modul gelap). */
export function buildQrMatrix(text: string, ecc: QrEcc = "M"): boolean[][] {
  const { ver, data } = encodeCodewords(toUtf8Bytes(text), ecc);
  const all = addEccAndInterleave(data, ver, ecc);
  return new QrBuilder(ver, ecc, all).modules;
}

/** Mengubah matriks QR menjadi atribut `d` untuk elemen <path> SVG (kolom-kolom gelap digabung per baris). */
export function qrToSvgPath(matrix: boolean[][], quiet = 4): { d: string; size: number } {
  const n = matrix.length;
  let d = "";
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!matrix[y][x]) { x++; continue; }
      let w = 1;
      while (x + w < n && matrix[y][x + w]) w++;
      d += `M${x + quiet} ${y + quiet}h${w}v1h${-w}z`;
      x += w;
    }
  }
  return { d, size: n + quiet * 2 };
}