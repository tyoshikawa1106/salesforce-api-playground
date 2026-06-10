import type { LookupObjectLabel } from "./activity-task-form";

export function getLookupIconMeta(objectLabel: LookupObjectLabel) {
    if (objectLabel === "取引先") {
        return { iconClassName: "slds-icon-standard-account", iconName: "account" as const };
    }

    if (objectLabel === "ケース") {
        return { iconClassName: "slds-icon-standard-case", iconName: "account" as const };
    }

    if (objectLabel === "商談") {
        return { iconClassName: "slds-icon-standard-opportunity", iconName: "account" as const };
    }

    if (objectLabel === "リード") {
        return { iconClassName: "slds-icon-standard-lead", iconName: "contact" as const };
    }

    if (objectLabel === "取引先責任者") {
        return { iconClassName: "slds-icon-standard-contact", iconName: "contact" as const };
    }

    if (objectLabel === "ユーザー") {
        return { iconClassName: "slds-icon-standard-user", iconName: "user" as const };
    }

    return { iconClassName: "slds-icon-standard-record", iconName: "account" as const };
}
