"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SvgIcon } from "./SvgIcon";

/* ============ ikon kecil ============ */
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
function Search() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4" />
    </svg>
  );
}

/* ============ hook popover (klik di luar / Esc menutup) ============ */
function usePopover(estHeight: number) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPop = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      setUp(below < estHeight + 16 && r.top > below);
    }
    setOpen(true);
  };

  return { open, setOpen, up, ref, openPop };
}

/* ============================================================
   CUSTOM SELECT (dropdown)
   ============================================================ */
interface CustomSelectProps {
  id?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (v: string) => void;
  /** Tampilkan kolom pencarian (otomatis aktif bila opsi > 10) */
  searchable?: boolean;
}

export function CustomSelect({
  id,
  value,
  options,
  placeholder = "Pilih...",
  onChange,
  searchable,
}: CustomSelectProps) {
  const { open, setOpen, up, ref, openPop } = usePopover(300);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const withSearch = searchable ?? options.length > 10;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? options.filter((o) => o.toLowerCase().includes(s)) : options;
  }, [q, options]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function show() {
    setQ("");
    setActive(Math.max(0, options.indexOf(value)));
    openPop();
  }

  function choose(o: string) {
    onChange(o);
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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`db-sel${open ? " open" : ""}`} ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        className={`db-sel-btn${value ? "" : " ph"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
      >
        <span className="db-sel-txt">{value || placeholder}</span>
        <Chev />
      </button>

      {open && (
        <div className={`db-pop db-sel-pop${up ? " up" : ""}`}>
          {withSearch && (
            <div className="db-sel-search">
              <Search />
              <input
                type="text"
                value={q}
                placeholder="Cari..."
                aria-label="Cari opsi"
                autoFocus={
                  typeof window !== "undefined" &&
                  !window.matchMedia("(pointer: coarse)").matches
                }
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
              />
            </div>
          )}
          <ul role="listbox" ref={listRef}>
            {filtered.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <span>{o}</span>
                {o === value && <Check />}
              </li>
            ))}
            {!filtered.length && <li className="db-sel-empty">Tidak ditemukan</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DATE PICKER (tanggal) — nilai: "YYYY-MM-DD"
   ============================================================ */
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parseISO(s: string) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return r ? { y: +r[1], m: +r[2] - 1, d: +r[3] } : null;
}
function todayParts() {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
}

interface DatePickerProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}

export function DatePicker({ id, value, placeholder = "Pilih tanggal", onChange, min, max }: DatePickerProps) {
  const { open, setOpen, up, ref, openPop } = usePopover(380);
  const [mode, setMode] = useState<"day" | "month" | "year">("day");
  const [view, setView] = useState(() => {
    const p = parseISO(value) ?? todayParts();
    return { y: p.y, m: p.m };
  });

  const sel = parseISO(value);
  const tdy = todayParts();
  const tdyISO = toISO(tdy.y, tdy.m, tdy.d);
  const label = sel ? `${sel.d} ${MONTHS[sel.m]} ${sel.y}` : "";
  const outOfRange = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  function show() {
    const p = parseISO(value) ?? todayParts();
    setView({ y: p.y, m: p.m });
    setMode("day");
    openPop();
  }

  function shift(dir: number) {
    if (mode === "day") {
      const t = new Date(view.y, view.m + dir, 1);
      setView({ y: t.getFullYear(), m: t.getMonth() });
    } else if (mode === "month") {
      setView((v) => ({ ...v, y: v.y + dir }));
    } else {
      setView((v) => ({ ...v, y: v.y + dir * 12 }));
    }
  }

  const yearStart = view.y - (view.y % 12);
  const headLabel =
    mode === "day" ? `${MONTHS[view.m]} ${view.y}` : mode === "month" ? String(view.y) : `${yearStart} – ${yearStart + 11}`;

  const firstDow = new Date(view.y, view.m, 1).getDay();
  const dim = new Date(view.y, view.m + 1, 0).getDate();

  return (
    <div className={`db-sel${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        className={`db-sel-btn${value ? "" : " ph"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
      >
        <SvgIcon name="cal" className="db-sel-ic" />
        <span className="db-sel-txt">{label || placeholder}</span>
        <Chev />
      </button>

      {open && (
        <div className={`db-pop db-dp${up ? " up" : ""}`} role="dialog" aria-label="Pilih tanggal">
          <div className="db-dp-head">
            <button type="button" className="db-dp-nav" onClick={() => shift(-1)} aria-label="Sebelumnya">
              <SvgIcon name="chv" className="" style={{ width: 17, height: 17 }} />
            </button>
            <button
              type="button"
              className="db-dp-title"
              onClick={() => setMode((m) => (m === "day" ? "month" : m === "month" ? "year" : "day"))}
            >
              {headLabel}
            </button>
            <button type="button" className="db-dp-nav" onClick={() => shift(1)} aria-label="Berikutnya">
              <SvgIcon name="chr" className="" style={{ width: 17, height: 17 }} />
            </button>
          </div>

          {mode === "day" && (
            <div className="db-dp-grid">
              {DOW.map((d) => (
                <small key={d}>{d}</small>
              ))}
              {Array.from({ length: firstDow }).map((_, i) => (
                <span key={`e${i}`} />
              ))}
              {Array.from({ length: dim }).map((_, i) => {
                const day = i + 1;
                const iso = toISO(view.y, view.m, day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={outOfRange(iso)}
                    className={`${iso === value ? "on" : ""}${iso === tdyISO ? " td" : ""}`}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {mode === "month" && (
            <div className="db-dp-cells">
              {MONTHS.map((mn, i) => (
                <button
                  key={mn}
                  type="button"
                  className={sel && sel.y === view.y && sel.m === i ? "on" : ""}
                  onClick={() => {
                    setView((v) => ({ ...v, m: i }));
                    setMode("day");
                  }}
                >
                  {mn.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {mode === "year" && (
            <div className="db-dp-cells">
              {Array.from({ length: 12 }).map((_, i) => {
                const yr = yearStart + i;
                return (
                  <button
                    key={yr}
                    type="button"
                    className={sel && sel.y === yr ? "on" : ""}
                    onClick={() => {
                      setView((v) => ({ ...v, y: yr }));
                      setMode("month");
                    }}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          <div className="db-dp-foot">
            <button
              type="button"
              disabled={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Hapus
            </button>
            <button
              type="button"
              disabled={outOfRange(tdyISO)}
              onClick={() => {
                onChange(tdyISO);
                setOpen(false);
              }}
            >
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TIME PICKER (jam) — nilai: "HH:MM" (24 jam)
   ============================================================ */
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

interface TimePickerProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

export function TimePicker({ id, value, placeholder = "Pilih jam", onChange }: TimePickerProps) {
  const { open, setOpen, up, ref, openPop } = usePopover(300);
  const bodyRef = useRef<HTMLDivElement>(null);

  const m = /^(\d{2}):(\d{2})$/.exec(value);
  const hh = m ? m[1] : "";
  const mm = m ? m[2] : "";
  const minutes = mm && !MINUTES.includes(mm) ? [...MINUTES, mm].sort() : MINUTES;

  useEffect(() => {
    if (!open) return;
    bodyRef.current?.querySelectorAll<HTMLElement>("button.on").forEach((el) => {
      const col = el.parentElement;
      if (col) col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2;
    });
  }, [open]);

  return (
    <div className={`db-sel${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        className={`db-sel-btn${value ? "" : " ph"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPop())}
      >
        <SvgIcon name="clock" className="db-sel-ic" />
        <span className="db-sel-txt">{value || placeholder}</span>
        <Chev />
      </button>

      {open && (
        <div className={`db-pop db-tp${up ? " up" : ""}`} role="dialog" aria-label="Pilih jam">
          <div className="db-tp-body" ref={bodyRef}>
            <div className="db-tp-colwrap">
              <small>Jam</small>
              <div className="db-tp-col">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={h === hh ? "on" : ""}
                    onClick={() => onChange(`${h}:${mm || "00"}`)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="db-tp-sep">:</div>
            <div className="db-tp-colwrap">
              <small>Menit</small>
              <div className="db-tp-col">
                {minutes.map((x) => (
                  <button
                    key={x}
                    type="button"
                    className={x === mm ? "on" : ""}
                    onClick={() => onChange(`${hh || "00"}:${x}`)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="db-dp-foot">
            <button
              type="button"
              disabled={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Hapus
            </button>
            <button type="button" className="strong" onClick={() => setOpen(false)}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}