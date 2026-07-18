"use client";

import { updateInvoiceStatus, deleteInvoice } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/lib/types";

export function InvoiceStatusActions({
  projectId,
  invoiceId,
  status,
}: {
  projectId: string;
  invoiceId: string;
  status: InvoiceStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {status === "draft" && (
        <form action={updateInvoiceStatus.bind(null, projectId, invoiceId, "sent")}>
          <Button type="submit" size="sm">
            Mark as Sent
          </Button>
        </form>
      )}
      {status === "sent" && (
        <form action={updateInvoiceStatus.bind(null, projectId, invoiceId, "paid")}>
          <Button type="submit" size="sm">
            Mark as Paid
          </Button>
        </form>
      )}
      <form
        action={deleteInvoice.bind(null, projectId, invoiceId)}
        onSubmit={(e) => {
          if (!confirm("Delete this invoice? Its expenses will return to the unbilled pool.")) {
            e.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
          Delete
        </Button>
      </form>
    </div>
  );
}
