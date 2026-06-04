import type { AccountRecord, ContactRecord } from "@/lib/salesforce/records";
import type { RecycleBinItem as SalesforceRecycleBinItem } from "@/lib/salesforce/recycle-bin";

export type Account = AccountRecord;
export type Contact = ContactRecord;
export type RecycleBinItem = SalesforceRecycleBinItem;

export type ModalState =
    | { type: "account"; mode: "create"; record?: undefined }
    | { type: "account"; mode: "edit"; record: Account }
    | { type: "contact"; mode: "create"; record?: undefined }
    | { type: "contact"; mode: "edit"; record: Contact };

export type DeleteState =
    | { type: "account"; ids: string[]; label: string }
    | { type: "contact"; ids: string[]; label: string };

export type Notice = {
    tone: "success" | "error" | "info";
    message: string;
};

export type ActiveTab = "home" | "accounts" | "contacts" | "integration" | "recycleBin";
