import { TradeDetailsForm, type TradeImage } from "@/components/trades/trade-details-form";
import { Button } from "@/components/ui/button";

export function TradeDetails({
  projectId,
  tradeId,
  description,
  images,
  canEdit,
}: {
  projectId: string;
  tradeId: string;
  description: string | null;
  images: TradeImage[];
  canEdit: boolean;
}) {
  const hasContent = Boolean(description) || images.length > 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background/60 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">Spec details</p>
        {canEdit && (
          <TradeDetailsForm
            projectId={projectId}
            tradeId={tradeId}
            description={description}
            images={images}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs">
                {hasContent ? "Edit" : "Add details"}
              </Button>
            }
          />
        )}
      </div>
      {hasContent ? (
        <>
          {description && <p className="whitespace-pre-wrap text-sm">{description}</p>}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map(
                (image) =>
                  image.url && (
                    <a key={image.id} href={image.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.file_name}
                        className="h-16 w-16 rounded-md border object-cover"
                      />
                    </a>
                  )
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No details added yet.</p>
      )}
    </div>
  );
}
