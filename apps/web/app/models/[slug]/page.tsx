import { ModelPage } from "../../../src/components/model-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ModelPage slug={slug} />;
}
