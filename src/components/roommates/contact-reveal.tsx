import React from "react";
import type { RoommateContact } from "@/lib/api/roommates";

export interface ContactRevealProps {
  contact: {
    from: RoommateContact;
    to: RoommateContact;
  };
  myUid: string;
}

export function ContactReveal({ contact, myUid }: ContactRevealProps) {
  const other = contact.from.uid === myUid ? contact.to : contact.from;
  const hasPhoneOrEmail = Boolean(other.phone || other.email);

  return (
    <div className="rounded border border-hairline bg-paper p-4 space-y-3 mt-3">
      <h4 className="font-heading text-body font-semibold text-ink">
        Contact details
      </h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-caption">
        {other.displayName && (
          <div>
            <dt className="text-muted-ink">Name</dt>
            <dd className="font-medium text-ink">{other.displayName}</dd>
          </div>
        )}
        {other.college && (
          <div>
            <dt className="text-muted-ink">College</dt>
            <dd className="font-medium text-ink">{other.college}</dd>
          </div>
        )}
        {other.phone && (
          <div>
            <dt className="text-muted-ink">Phone</dt>
            <dd className="font-medium text-ink">
              <a
                href={`tel:${other.phone}`}
                className="text-ballpoint hover:underline"
              >
                {other.phone}
              </a>
            </dd>
          </div>
        )}
        {other.email && (
          <div>
            <dt className="text-muted-ink">Email</dt>
            <dd className="font-medium text-ink">
              <a
                href={`mailto:${other.email}`}
                className="text-ballpoint hover:underline"
              >
                {other.email}
              </a>
            </dd>
          </div>
        )}
      </dl>
      {!hasPhoneOrEmail && (
        <p className="text-caption text-muted-ink">
          They have not added a phone number or email yet.
        </p>
      )}
    </div>
  );
}
