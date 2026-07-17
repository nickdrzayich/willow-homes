"use client";

import { useState, type ReactElement } from "react";
import { upsertBid } from "@/lib/actions/bids";
import { CompanyPicker, type CompanyOption } from "@/components/companies/company-picker";
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
}

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
  const action = upsertBid.bind(null, projectId, tradeId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bid ? "Edit bid" : "Add bid"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
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
          <Button type="submit">{bid ? "Save bid" : "Add bid"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
