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

export function formatDateOnly(value?: string): string {
    if (!value) {
        return "-";
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const date = dateOnlyMatch
        ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
        : new Date(value);

    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium"
    }).format(date);
}

export function getContactName(contact: Contact): string {
    return `${contact.FirstName ?? ""} ${contact.LastName}`.trim();
}

export function getAccountBilling(account: Account): string {
    return [account.BillingCity, account.BillingCountry].filter(Boolean).join(", ");
}
