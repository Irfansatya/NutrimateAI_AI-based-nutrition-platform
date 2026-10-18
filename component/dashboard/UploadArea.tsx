"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";

const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOC_TYPES = ["image/jpeg", "image/png", "application/pdf"];

interface UploadAreaProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** true: hanya gambar (JPG, PNG, WEBP). false: gambar JPG/PNG atau PDF */
  imageOnly?: boolean;
  max?: number;
  maxSizeMB?: number;
}

function fmtSize(b: number) {
  return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1048576).toFixed(1) + " MB";
}

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="db-nh-file">
      {file.type.startsWith("image/") ? (
        url ? <img src={url} alt={file.name} /> : <div className="db-nh-file-ph" />
      ) : (
        <div className="db-nh-file-ph">
          <SvgIcon name="doc" className="" style={{ width: 24, height: 24, color: "var(--g)" }} />
        </div>
      )}
      <div>
        <b>{file.name}</b>
        <small>{fmtSize(file.size)}</small>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Hapus ${file.name}`}>
        <SvgIcon name="trash" className="" style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}

export default function UploadArea({
  label,
  files,
  onChange,
  imageOnly = false,
  max = 5,
  maxSizeMB = 5,
}: UploadAreaProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [msg, setMsg] = React.useState("");
  const allowed = imageOnly ? IMG_TYPES : DOC_TYPES;
  const formatText = imageOnly ? "JPG, PNG, atau WEBP" : "JPG, PNG, atau PDF";

  function add(list: FileList | null) {
    if (!list) return;
    const ok: File[] = [];
    let err = "";
    for (const f of Array.from(list)) {
      if (!allowed.includes(f.type)) {
        err = `Format ${f.name} tidak didukung. Gunakan ${formatText}.`;
        continue;
      }
      if (f.size > maxSizeMB * 1048576) {
        err = `Ukuran ${f.name} melebihi ${maxSizeMB} MB.`;
        continue;
      }
      ok.push(f);
    }
    const room = max - files.length;
    if (ok.length > room) err = `Maksimal ${max} file.`;
    if (ok.length) onChange([...files, ...ok.slice(0, room)]);
    setMsg(err);
  }

  return (
    <div>
      <div className="db-nh-files">
        {files.map((f, i) => (
          <FileRow
            key={`${f.name}-${f.size}-${i}`}
            file={f}
            onRemove={() => { onChange(files.filter((_, j) => j !== i)); setMsg(""); }}
          />
        ))}
      </div>
      {files.length < max && (
        <button className="db-nh-up" type="button" onClick={() => ref.current?.click()}>
          <SvgIcon name="up" className="" style={{ width: 24, height: 24 }} />
          <div>
            <b>{label}</b>
            <small>
              {formatText} · maks. {maxSizeMB} MB{max > 1 ? ` · hingga ${max} file` : ""}
            </small>
          </div>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={allowed.join(",")}
        multiple={max > 1}
        hidden
        onChange={(e) => { add(e.target.files); e.target.value = ""; }}
      />
      {msg && <div className="db-em">{msg}</div>}
    </div>
  );
}