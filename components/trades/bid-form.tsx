"use client";

import { useState, type ReactElement } from "react";
import { FileText, X } from "lucide-react";
import { upsertBid, removeBidFile } from "@/lib/actions/bids";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { CompanyPicker, type CompanyOption } from "@/components/companies/company-picker";
import { FileDropInput } from "@/components/expenses/file-drop-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BidStatus } from "@/lib/types";

export interface EditableBid {
  id: string;
  company_id: string | null;
  company_name: string | null;
  amount: number | null;
  status: BidStatus;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  file_url: string | null;
}

const BUCKET = "bid-files";

export function BidForm({
  projectId,
  tradeId,
  companies,
  bid,
  trigger,
}: {
  projectId: string;
  tradeId: string;
  companies: CompanyOption[];
  bid?: EditableBid;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const action = upsertBid.bind(null, projectId, tradeId);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setUploadError(null);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bid ? "Edit bid" : "Add bid"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            setUploadError(null);
            const scrollY = window.scrollY;
            const file = formData.get("bidFile");
            formData.delete("bidFile");

            if (file instanceof File && file.size > 0) {
              const bidId = bid?.id ?? crypto.randomUUID();
              const path = `${projectId}/${bidId}/${sanitizeFileName(file.name)}`;
              const { error } = await createClient()
                .storage.from(BUCKET)
                .upload(path, file, { upsert: true });

              if (error) {
                setUploadError(error.message);
                return;
              }

              formData.set("id", bidId);
              formData.set("filePath", path);
              formData.set("fileName", file.name);
            }

            await action(formData);
            setOpen(false);
            requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
          }}
          className="flex flex-col gap-4"
        >
          {bid && <input type="hidden" name="bidId" value={bid.id} />}
          <div className="flex flex-col gap-2">
            <Label>Company</Label>
            <CompanyPicker
              companies={companies}
              defaultCompanyId={bid?.company_id}
              defaultCompanyName={bid?.company_name}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={bid?.amount ?? ""}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={bid?.status ?? "sent"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Bid Requested</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="actual">Actual bid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={bid?.notes ?? ""} rows={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bid file (PDF or image)</Label>
            {bid?.file_path && bid.file_url && (
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/60 p-2">
                <a
                  href={bid.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{bid.file_name ?? "View file"}</span>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removeBidFile(projectId, bid.id, bid.file_path!)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <FileDropInput name="bidFile" accept="image/*,.pdf" />
          </div>
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          <Button type="submit">{bid ? "Save bid" : "Add bid"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
