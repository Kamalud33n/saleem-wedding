import { Sparkle } from "lucide-react";

export default function Divider({ label }) {
  return (
    <div className="flex items-center justify-center gap-4 py-2" aria-hidden={!label}>
      <span className="stitch-line flex-1 max-w-[80px] opacity-70" />
      <Sparkle size={14} className="text-vermilion shrink-0" strokeWidth={1.5} />
      {label ? (
        <span className="font-label text-[10px] tracking-[0.3em] uppercase text-betel shrink-0">
          {label}
        </span>
      ) : null}
      <Sparkle size={14} className="text-vermilion shrink-0" strokeWidth={1.5} />
      <span className="stitch-line flex-1 max-w-[80px] opacity-70" />
    </div>
  );
}
