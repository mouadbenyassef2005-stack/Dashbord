import { QuranReaderLoader } from "@/components/reader/QuranReaderLoader";
import { READER_SURAHS } from "@/content/mushaf";

export function generateStaticParams() {
  return READER_SURAHS.map((id) => ({ id: String(id) }));
}

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuranReaderLoader surahId={Number(id)} />;
}
