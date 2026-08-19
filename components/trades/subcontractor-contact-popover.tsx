"use client";

import Link from "next/link";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SubcontractorContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export function SubcontractorContactPopover({
  companyId,
  companyName,
  contacts,
  children,
}: {
  companyId: string;
  companyName: string;
  contacts: SubcontractorContact[];
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<button type="button" className="min-w-0 truncate text-left hover:underline" />}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="truncate text-sm font-medium">{companyName}</p>
        {contacts.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">No contact info on file.</p>
        ) : (
          <div className="mt-2 flex flex-col gap-2.5">
            {contacts.map((contact) => (
              <div key={contact.id}>
                <p className="text-xs font-medium text-muted-foreground">{contact.name}</p>
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 text-sm hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1.5 truncate text-sm hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {contact.email}
                    </a>
                  )}
                  {!contact.phone && !contact.email && (
                    <p className="text-sm text-muted-foreground">No phone or email.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          href={`/admin/subcontractors/${companyId}`}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View full subcontractor page <ArrowUpRight className="h-3 w-3" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
