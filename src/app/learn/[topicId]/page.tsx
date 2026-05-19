import { TopicDetail } from "@/components/pages/TopicDetail";

export default async function Page({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  return <TopicDetail topicId={topicId} />;
}
