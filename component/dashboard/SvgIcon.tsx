"use client";
// SVG icon helper — returns inline SVG string paths
// Paths ported from reference/NutrimateAI_User.html IC object

export const IC: Record<string, string> = {
  doc: "M6 3h9l4 4v14H6z M9 12h6 M9 16h6",
  chk: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 8v8 M8 12h8",
  cal: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4 M8 14h2 M12 14h2 M16 14h2",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  asst: "M3 14h4v6H3z M7 15l5 1 5-3a1.5 1.5 0 0 1 2 2l-5 4H7 M12 4.5a2 2 0 0 1 3 0 2 2 0 0 1 0 3l-3 3-3-3a2 2 0 0 1 3-3z",
  inf: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01",
  usr: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6",
  chv: "M15 6l-6 6 6 6",
  chr: "M9 6l6 6-6 6",
  cam: "M4 8h3l2-3h6l2 3h3v12H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  pen: "M4 20h4L19 9l-4-4L4 16z",
  shd: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4",
  book: "M4 19.5V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2.5z M6 17h13v4H6 M9 7h6 M9 10.5h4",
  trend: "M4 19V5 M4 19h16 M7 15l4-4 3 3 5-6",
  wallet: "M3 7a2 2 0 0 1 2-2h13v4 M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z M16 14.5h.01",
  up: "M12 16V4 M7 9l5-5 5 5 M4 20h16",
  ok: "M5 12.5l4.5 4.5L19 7.5",
  qr: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h3 M20 14v3 M14 18v2h3 M20 20h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  x: "M6 6l12 12 M18 6L6 18",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6",
  plus: "M12 5v14 M5 12h14",
  bank: "M3 9l9-5 9 5 M5 9v9 M9.5 9v9 M14.5 9v9 M19 9v9 M3 20h18",
  pin: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  down: "M12 4v12 M7 11l5 5 5-5 M4 20h16",
  check_ok: "M5 12.5l4.5 4.5L19 7.5",
};

interface SvgIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SvgIcon({ name, className = "db-ic", style }: SvgIconProps) {
  const path = IC[name] ?? "";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {path.split(" M").map((segment, i) => (
        <path key={i} d={i === 0 ? segment : "M" + segment} />
      ))}
    </svg>
  );
}
