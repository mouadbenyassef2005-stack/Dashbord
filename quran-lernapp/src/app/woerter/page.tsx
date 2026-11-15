"use client";
import { useState } from "react";
import { ArabicText } from "@/components/ArabicText";
import { Card, Chip, PageHeader, cx } from "@/components/ui";
import { QURAN_SOURCE_INFO, TRANSFER_WORDS, UNIQUE_WORDS } from "@/content/quran";
import type { QuranWord } from "@/content/types";
import { statusOf, type Status } from "@/lib/progress";
import { useProgress } from "@/lib/store";

const FILTERS: { id: Status | "all"; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "new", label: "Neu" },
  { id: "learning", label: "In Übung" },
  { id: "known", label: "Sicher" },
];
const STATUS_LABEL: Record<Status, string> = { new: "Neu", learning: "In Übung", known: "Sicher" };

export default function Woerter() {
  const { progress: p } = useProgress();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const unique = [...UNIQUE_WORDS, ...TRANSFER_WORDS.filter((w) => p.items[`w:${w.id}`])];
  const list = unique.filter((w) => filter === "all" || statusOf(p, `w:${w.id}`) === filter);

  return (
    <div>
      <PageHeader title="Wortdatenbank" subtitle={`${unique.length} Wörter – Lernpfad-Suren plus alle Transfer-Wörter, die du schon geübt hast. Jeweils mit Fundstelle.`} />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cx("rounded-full px-4 py-2 text-sm font-medium transition", filter === f.id ? "bg-primary text-white" : "bg-surface text-ink/70 border border-line hover:border-primary/40")}>{f.label}</button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((w) => <WordCard key={w.id} w={w} status={statusOf(p, `w:${w.id}`)} open={open === w.id} onToggle={() => setOpen(open === w.id ? null : w.id)} showHint={p.settings.showHint} />)}
      </ul>
      {list.length === 0 && <p className="mt-8 text-center text-muted">Keine Wörter in dieser Ansicht.</p>}
      <p className="mt-8 text-xs leading-relaxed text-muted">Quelle Arabisch: {QURAN_SOURCE_INFO.arabic}. Transliteration: {QURAN_SOURCE_INFO.transliteration}. Lizenz: {QURAN_SOURCE_INFO.license}. {QURAN_SOURCE_INFO.note}</p>
    </div>
  );
}

function WordCard({ w, status, open, onToggle, showHint }: { w: QuranWord; status: Status; open: boolean; onToggle: () => void; showHint: boolean }) {
  return (
    <li>
      <Card className="!p-4">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <ArabicText text={w.uthmani} size="md" className="leading-[1.6]" />
            {showHint && w.transliteration && <p className="text-sm text-muted">{w.transliteration}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Chip tone={status === "known" ? "ok" : status === "learning" ? "gold" : "neutral"}>{STATUS_LABEL[status]}</Chip>
            <span className="text-xs text-muted">{w.surahName} {w.surah}:{w.ayah}</span>
          </div>
        </button>
        {open && (
          <dl className="rise mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
            <div><dt className="text-xs text-muted">Fundstelle</dt><dd>Sure {w.surah} ({w.surahName}), Ayah {w.ayah}, Wort {w.position}</dd></div>
            <div><dt className="text-xs text-muted">Schwierigkeit</dt><dd>{"●".repeat(w.difficulty)}{"○".repeat(3 - w.difficulty)}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Buchstaben ({w.letters.length})</dt><dd className="arabic text-2xl leading-[1.8]" dir="rtl">{w.letters.join(" ")}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Zeichen / Harakat ({w.harakat.length})</dt><dd className="arabic text-2xl leading-[1.8]" dir="rtl">{w.harakat.length ? w.harakat.map((h) => "ـ" + h).join("  ") : "–"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Referenz-Audio</dt><dd>{w.audioUrl ? "Vorhanden" : "Noch nicht aufgenommen (menschlicher Sprecher geplant)"}</dd></div>
          </dl>
        )}
      </Card>
    </li>
  );
}
