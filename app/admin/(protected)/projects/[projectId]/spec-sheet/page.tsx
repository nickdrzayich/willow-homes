import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/expenses/print-button";

export default async function SpecSheetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: trades }] = await Promise.all([
    supabase.from("projects").select("id, name, address").eq("id", projectId).single(),
    supabase
      .from("trades")
      .select("id, name, description, trade_images(id, storage_path, file_name, sort_order)")
      .eq("project_id", projectId)
      .order("name", { ascending: true }),
  ]);

  if (!project) notFound();

  const allImagePaths = (trades ?? []).flatMap((t) => (t.trade_images ?? []).map((img) => img.storage_path));
  const signedUrlByPath = new Map<string, string>();
  if (allImagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage.from("trade-images").createSignedUrls(allImagePaths, 3600);
    for (const entry of signedUrls ?? []) {
      if (entry.path && entry.signedUrl) signedUrlByPath.set(entry.path, entry.signedUrl);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href={`/admin/projects/${projectId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to project
        </Link>
        <PrintButton />
      </div>

      <div className="flex flex-col gap-8 rounded-xl border bg-card p-8 print:border-none print:p-0 print:shadow-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.address && <p className="mt-1 text-sm text-muted-foreground">{project.address}</p>}
          <p className="mt-1 text-sm text-muted-foreground">Specification Sheet</p>
        </div>

        <div className="flex flex-col gap-8">
          {(trades ?? []).map((trade) => {
            const images = (trade.trade_images ?? [])
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((img) => ({ ...img, url: signedUrlByPath.get(img.storage_path) ?? null }));

            return (
              <div key={trade.id} className="flex flex-col gap-2 break-inside-avoid border-b pb-6 last:border-0">
                <h2 className="text-base font-semibold">{trade.name}</h2>
                {trade.description ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{trade.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No details provided yet.</p>
                )}
                {images.length > 0 && (
                  <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map(
                      (image) =>
                        image.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={image.id}
                            src={image.url}
                            alt={image.file_name}
                            className="aspect-square w-full rounded-md border object-cover"
                          />
                        )
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {(trades ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No products/services on this project yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
