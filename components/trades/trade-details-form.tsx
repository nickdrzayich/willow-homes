"use client";

import { useState, type ReactElement } from "react";
import { X } from "lucide-react";
import { saveTradeDetails, deleteTradeImage } from "@/lib/actions/trades";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { ImageDropInput } from "@/components/trades/image-drop-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface TradeImage {
  id: string;
  file_name: string;
  storage_path: string;
  url: string | null;
}

const BUCKET = "trade-images";

export function TradeDetailsForm({
  projectId,
  tradeId,
  description,
  images,
  trigger,
}: {
  projectId: string;
  tradeId: string;
  description: string | null;
  images: TradeImage[];
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setNewFiles([]);
          setUploadError(null);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product/service details</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            setUploadError(null);
            const supabase = createClient();
            const uploaded: { path: string; name: string }[] = [];

            for (const file of newFiles) {
              const path = `${projectId}/${tradeId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
              const { error } = await supabase.storage.from(BUCKET).upload(path, file);
              if (error) {
                setUploadError(error.message);
                return;
              }
              uploaded.push({ path, name: file.name });
            }

            for (const file of uploaded) {
              formData.append("imagePath", file.path);
              formData.append("imageName", file.name);
            }

            await saveTradeDetails(projectId, tradeId, formData);
            setNewFiles([]);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          {images.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((image) => (
                  <div key={image.id} className="group relative h-16 w-16 overflow-hidden rounded-md border">
                    {image.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt={image.file_name} className="h-full w-full object-cover" />
                    )}
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => deleteTradeImage(projectId, image.id, image.storage_path)}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label>Add photos</Label>
            <ImageDropInput files={newFiles} onChange={setNewFiles} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={description ?? ""}
              rows={5}
              placeholder="What's specified here -- brand, model, finish, anything worth noting."
            />
          </div>
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          <Button type="submit">Save details</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
