import type { AccountRecord, ContactRecord } from "@/lib/salesforce/records";

export type Account = AccountRecord;
export type Contact = ContactRecord;

export type ModalState =
    | { type: "account"; mode: "create"; record?: undefined }
    | { type: "account"; mode: "edit"; record: Account }
    | { type: "contact"; mode: "create"; record?: undefined }
    | { type: "contact"; mode: "edit"; record: Contact };

export type DeleteState =
    | { type: "account"; id: string; label: string }
    | { type: "contact"; id: string; label: string };

export type Notice = {
    tone: "success" | "error" | "info";
    message: string;
};

export type ActiveTab = "home" | "accounts" | "contacts";
