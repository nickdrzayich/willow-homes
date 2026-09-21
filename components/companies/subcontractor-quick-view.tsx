"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { updateCompany } from "@/lib/actions/companies";
import { CompanyDetailsForm } from "@/components/companies/company-details-form";
import { ContactsSection, type Contact } from "@/components/companies/contacts-section";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SubcontractorQuickView({
  company,
  contacts,
  categoryNames,
  canEdit,
  trigger,
}: {
  company: { id: string; name: string; notes: string | null; category_names: string[]; archived: boolean };
  contacts: Contact[];
  categoryNames: string[];
  canEdit: boolean;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const updateAction = updateCompany.bind(null, company.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {company.name}
            {company.archived && <Badge variant="secondary">Archived</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <ContactsSection companyId={company.id} contacts={contacts} canEdit={canEdit} />
          {canEdit ? (
            <CompanyDetailsForm action={updateAction} company={company} categoryNames={categoryNames} />
          ) : (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have edit access to shared subcontractor data.
            </p>
          )}
          <Link
            href={`/admin/subcontractors/${company.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View full page (bid history, archive/delete) <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
