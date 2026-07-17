import { Mail, Phone, Pencil, Trash2, UserPlus, User } from "lucide-react";
import { ContactForm } from "@/components/companies/contact-form";
import { deleteContact } from "@/lib/actions/contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export function ContactsSection({
  companyId,
  contacts,
}: {
  companyId: string;
  contacts: Contact[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Contacts</h2>
        <ContactForm
          companyId={companyId}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <UserPlus className="h-3.5 w-3.5" /> Add contact
            </Button>
          }
        />
      </div>

      {!contacts.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-1.5 py-8 text-center">
            <User className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No contacts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{contact.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {contact.phone}
                    </span>
                  )}
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {contact.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ContactForm
                  companyId={companyId}
                  contact={contact}
                  trigger={
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <form action={deleteContact.bind(null, companyId, contact.id)}>
                  <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
