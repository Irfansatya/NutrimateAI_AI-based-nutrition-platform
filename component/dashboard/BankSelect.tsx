"use client";
import React from "react";

export interface Bank {
  id: string;
  name: string;
  full: string;
}

/** Bank yang didukung untuk pencairan dana */
export const BANKS: Bank[] = [
  { id: "bca", name: "BCA", full: "Bank Central Asia" },
  { id: "bri", name: "BRI", full: "Bank Rakyat Indonesia" },
  { id: "mandiri", name: "Mandiri", full: "Bank Mandiri" },
  { id: "bni", name: "BNI", full: "Bank Negara Indonesia" },
  { id: "bsi", name: "BSI", full: "Bank Syariah Indonesia" },
];

/**
 * Logo bank versi vektor sederhana (inline SVG).
 * Untuk memakai logo resmi, ganti isi komponen ini dengan
 * <img src={`/banks/${id}.svg`} ... /> setelah berkas logo ditaruh di folder public/banks.
 */
export function BankLogo({ id, width = 36 }: { id: string; width?: number }) {
  const font = "Arial, Helvetica, sans-serif";
  return (
    <svg
      className="db-bk-logo"
      width={width}
      height={Math.round((width * 2) / 3)}
      viewBox="0 0 48 32"
      role="img"
      aria-label={`Logo ${id.toUpperCase()}`}
    >
      {id === "bca" && (
        <>
          <rect width="48" height="32" rx="6" fill="#0066AE" />
          <text x="24" y="21.5" textAnchor="middle" fontFamily={font} fontWeight="700" fontSize="15" fill="#fff">BCA</text>
        </>
      )}
      {id === "bri" && (
        <>
          <rect width="48" height="32" rx="6" fill="#00529C" />
          <text x="24" y="20" textAnchor="middle" fontFamily={font} fontWeight="700" fontSize="14.5" fill="#fff">BRI</text>
          <rect x="11" y="24" width="26" height="2.5" rx="1.25" fill="#F7941D" />
        </>
      )}
      {id === "mandiri" && (
        <>
          <rect width="48" height="32" rx="6" fill="#003D79" />
          <text x="24" y="20.5" textAnchor="middle" fontFamily={font} fontWeight="700" fontSize="10.5" fill="#FDB913">mandiri</text>
        </>
      )}
      {id === "bni" && (
        <>
          <rect x="0.5" y="0.5" width="47" height="31" rx="5.5" fill="#fff" stroke="#E3E6EC" />
          <text x="24" y="21" textAnchor="middle" fontFamily={font} fontWeight="700" fontSize="14.5">
            <tspan fill="#00727A">BN</tspan>
            <tspan fill="#F26B21">I</tspan>
          </text>
        </>
      )}
      {id === "bsi" && (
        <>
          <rect width="48" height="32" rx="6" fill="#00A39D" />
          <text x="22" y="21" textAnchor="middle" fontFamily={font} fontWeight="700" fontSize="14.5" fill="#fff">BSI</text>
          <circle cx="40" cy="9" r="2.6" fill="#F5A623" />
        </>
      )}
    </svg>
  );
}

function Chev() {
  return (
    <svg className="db-sel-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg className="db-sel-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

interface BankSelectProps {
  id?: string;
  /** id bank terpilih, mis. "bca" */
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function BankSelect({ id, value, onChange, placeholder = "Pilih bank tujuan" }: BankSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [up, setUp] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = BANKS.find((b) => b.id === value);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  function show() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      setUp(below < 330 && r.top > below);
    }
    setActive(Math.max(0, BANKS.findIndex((b) => b.id === value)));
    setOpen(true);
  }

  function choose(b: Bank) {
    onChange(b.id);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, BANKS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (BANKS[active]) choose(BANKS[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`db-sel${open ? " open" : ""}`} ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        className={`db-sel-btn${selected ? "" : " ph"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
      >
        {selected && <BankLogo id={selected.id} />}
        <span className="db-sel-txt">{selected ? selected.name : placeholder}</span>
        <Chev />
      </button>

      {open && (
        <div className={`db-pop db-sel-pop db-bk-pop${up ? " up" : ""}`}>
          <ul role="listbox" aria-label="Daftar bank">
            {BANKS.map((b, i) => (
              <li
                key={b.id}
                role="option"
                aria-selected={b.id === value}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(b)}
              >
                <span className="db-bk-opt">
                  <BankLogo id={b.id} />
                  <span className="db-bk-txt">
                    <b>{b.name}</b>
                    <small>{b.full}</small>
                  </span>
                </span>
                {b.id === value && <Check />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}