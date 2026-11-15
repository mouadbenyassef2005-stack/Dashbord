import { GameLoader } from "@/components/games/GameLoader";

export function generateStaticParams() {
  return ["memory", "quiz", "detektiv", "bauen"].map((kind) => ({ kind }));
}

export default async function GamePage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  return <GameLoader kind={kind} />;
}
