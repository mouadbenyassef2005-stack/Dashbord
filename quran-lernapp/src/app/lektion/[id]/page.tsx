import { LESSONS } from "@/content/lessons";
import { LessonLoader } from "@/components/lesson/LessonLoader";

export function generateStaticParams() {
  return [...LESSONS.map((l) => ({ id: l.id })), { id: "personal" }, ...LESSONS.map((l) => ({ id: `check-${l.id}` })), { id: "flagged" }, { id: "transfer" }, { id: "review" }];
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonLoader lessonId={id} />;
}
