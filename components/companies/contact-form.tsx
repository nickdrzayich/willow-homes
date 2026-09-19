"use client";

import { useState, type ReactElement } from "react";
import { toast } from "sonner";
import { addContact, updateContact } from "@/lib/actions/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface EditableContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export function ContactForm({
  companyId,
  contact,
  trigger,
}: {
  companyId: string;
  contact?: EditableContact;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const action = contact
    ? updateContact.bind(null, companyId, contact.id)
    : addContact.bind(null, companyId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              await action(formData);
              toast.success(contact ? "Contact saved" : "Contact added");
              setOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save contact");
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={contact?.name ?? ""} required autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
          </div>
          <Button type="submit">{contact ? "Save contact" : "Add contact"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
