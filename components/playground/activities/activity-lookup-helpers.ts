import type {
    ActivityLookupApiObject,
    ActivityLookupOption,
    ActivityLookupPayload,
    ActivityLookupState,
    ActivityRecordContext,
    RemoteLookupObjectLabel
} from "./activity-task-types";

export function compactLookupOptions(options: ActivityLookupOption[]) {
    const seen = new Set<string>();

    return options.filter((option) => {
        const key = `${option.objectLabel}:${option.id || option.label}`;
        if (!option.label || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export function buildDefaultTaskLookups({
    assignedOptions,
    context,
    nameOptions,
    relatedOptions
}: {
    assignedOptions: ActivityLookupOption[];
    context: ActivityRecordContext;
    nameOptions: ActivityLookupOption[];
    relatedOptions: ActivityLookupOption[];
}): ActivityLookupState {
    return {
        assigned: assignedOptions[0],
        name: context.parentType === "contact" ? nameOptions[0] : undefined,
        related: relatedOptions[0]
    };
}

function isActivityWhoLookup(option?: ActivityLookupOption): boolean {
    return option?.objectLabel === "リード" || option?.objectLabel === "取引先責任者";
}

function isActivityWhatLookup(option?: ActivityLookupOption): boolean {
    return option?.objectLabel === "ケース"
        || option?.objectLabel === "商談"
        || option?.objectLabel === "その他"
        || option?.objectLabel === "取引先";
}

export function buildActivityLookupPayload(lookups: ActivityLookupState): ActivityLookupPayload {
    return {
        OwnerId: lookups.assigned?.id,
        WhoId: isActivityWhoLookup(lookups.name) ? lookups.name?.id : undefined,
        WhatId: isActivityWhatLookup(lookups.related) ? lookups.related?.id : undefined
    };
}

export function getLookupApiObject(objectLabel: RemoteLookupObjectLabel): ActivityLookupApiObject {
    if (objectLabel === "取引先") {
        return "account";
    }

    if (objectLabel === "取引先責任者") {
        return "contact";
    }

    return "user";
}

export function getLookupObjectLabel(object: ActivityLookupApiObject) {
    if (object === "account") {
        return "取引先";
    }

    if (object === "contact") {
        return "取引先責任者";
    }

    return "ユーザー";
}
