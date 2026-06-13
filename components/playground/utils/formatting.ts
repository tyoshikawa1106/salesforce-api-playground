import type { Account, Contact } from "./types";

export function formatDate(value?: string): string {
    if (!value) {
        return "-";
    }
    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

export function getContactName(contact: Contact): string {
    return `${contact.FirstName ?? ""} ${contact.LastName}`.trim();
}

export function getAccountBilling(account: Account): string {
    return [account.BillingCity, account.BillingCountry].filter(Boolean).join(", ");
}
