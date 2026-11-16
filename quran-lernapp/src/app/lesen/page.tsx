"use client";
import Link from "next/link";
import { IconArrow } from "@/components/icons";
import { ButtonLink, Card, Chip, PageHeader } from "@/components/ui";
import { READER_SURAHS } from "@/content/mushaf";

export default function Lesen() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Quran lesen" subtitle="Lies laut vor – die App folgt jedem Wort und markiert abweichend gehörte Wörter sofort." />
      <Card data-testid="surah-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Chip tone="primary">Verfügbar</Chip>
            <p className="mt-2 text-lg font-semibold">Sure 85 · Al-Burūdsch</p>
            <p className="text-sm text-muted">22 Ayat · mekkanisch</p>
          </div>
          <span className="arabic text-4xl leading-[1.8]" dir="rtl" lang="ar">البروج</span>
        </div>
        <ol className="mt-4 space-y-1.5 text-[15px] text-ink/80">
          <li>1. Sure öffnen und aufs Mikrofon tippen.</li>
          <li>2. Laut vorlesen – langsam ist in Ordnung, Pausen auch.</li>
          <li>3. Rot markierte Wörter anhören und gezielt üben.</li>
        </ol>
        <ButtonLink href={`/lesen/${READER_SURAHS[0]}`} className="mt-5 w-full" data-testid="open-burooj">Sure Al-Burūdsch öffnen <IconArrow className="size-5" /></ButtonLink>
      </Card>
      <Card className="!bg-transparent !shadow-none border-dashed">
        <p className="font-semibold">Weitere Suren folgen</p>
        <p className="mt-1 text-sm text-muted">In dieser ersten Version gibt es nur diese eine Seite.</p>
      </Card>
      <p className="text-center text-sm"><Link href="/training" className="text-primary underline-offset-4 hover:underline">← Zurück zum Lesetraining</Link></p>
    </div>
  );
}
