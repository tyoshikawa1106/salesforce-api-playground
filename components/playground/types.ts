import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import type { AccountRecord, ContactRecord } from "@/lib/salesforce/records";
import type { RecycleBinItem as SalesforceRecycleBinItem } from "@/lib/salesforce/recycle-bin";

export type Account = AccountRecord;
export type Activity = ActivityTimelineItem;
export type Contact = ContactRecord;
export type RecycleBinItem = SalesforceRecycleBinItem;

export type ModalState =
    | { type: "account"; mode: "create"; record?: undefined }
    | { type: "account"; mode: "edit"; record: Account }
    | { type: "contact"; mode: "create"; record?: undefined }
    | { type: "contact"; mode: "edit"; record: Contact }
    | { type: "activity"; mode: "create"; activityType: Activity["type"]; record?: undefined }
    | { type: "activity"; mode: "edit"; record: Activity };

export type DeleteState =
    | { type: "account"; ids: string[]; label: string }
    | { type: "contact"; ids: string[]; label: string }
    | {
        type: "activity";
        activityType: Activity["type"];
        ids: string[];
        label: string;
        afterDelete?: () => Promise<void> | void;
    };

export type RestoreState = {
    items: RecycleBinItem[];
    label: string;
};

export type Notice = {
    tone: "success" | "error" | "info";
    message: string;
};

export type ActiveTab = "home" | "accounts" | "contacts" | "activities" | "integration" | "recycleBin";
