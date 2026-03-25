import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BrandSetViewer } from "@/components/brand-set-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicBrandSetPage({ params }: Props) {
  const { id: brandSetId } = await params;

  const supabase = await createClient();
  const { data: mockups } = await supabase
    .from("generated_mockups")
    .select("id, name, result_url, thumbnail_url, metadata, mockup_templates(name)")
    .contains("metadata", { brand_set_id: brandSetId })
    .order("created_at", { ascending: true });

  if (!mockups || mockups.length === 0) {
    notFound();
  }

  return <BrandSetViewer mockups={mockups} brandSetId={brandSetId} />;
}
