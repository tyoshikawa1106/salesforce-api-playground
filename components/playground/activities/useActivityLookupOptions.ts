"use client";

import { useMemo } from "react";
import {
    buildDefaultTaskLookups,
    compactLookupOptions,
    type ActivityLookupOption,
    type ActivityRecordContext
} from "./activity-task-form";

export function useActivityLookupOptions({
    assignedUserId,
    assignedUserName,
    context,
    nameLookupOptions,
    parentId,
    parentName,
    parentType,
    relatedId,
    relatedLookupOptions,
    relatedName
}: {
    assignedUserId?: string;
    assignedUserName?: string;
    context: ActivityRecordContext;
    nameLookupOptions: ActivityLookupOption[];
    parentId: string;
    parentName: string;
    parentType: ActivityRecordContext["parentType"];
    relatedId?: string;
    relatedLookupOptions: ActivityLookupOption[];
    relatedName?: string;
}) {
    const nameOptions = useMemo(() => compactLookupOptions(nameLookupOptions), [nameLookupOptions]);
    const relatedOptions = useMemo(
        () =>
            compactLookupOptions([
                ...relatedLookupOptions,
                ...(parentType === "account" ? [{ id: parentId, label: parentName, objectLabel: "取引先" as const }] : []),
                ...(parentType === "contact" && relatedName ? [{ id: relatedId || relatedName, label: relatedName, objectLabel: "取引先" as const }] : [])
            ]),
        [parentId, parentName, parentType, relatedId, relatedLookupOptions, relatedName]
    );
    const assignedOptions = useMemo(
        () =>
            compactLookupOptions(
                assignedUserName
                    ? [{
                        id: assignedUserId || assignedUserName,
                        label: assignedUserName,
                        objectLabel: "ユーザー" as const
                    }]
                    : []
            ),
        [assignedUserId, assignedUserName]
    );
    const defaultLookups = useMemo(
        () =>
            buildDefaultTaskLookups({
                assignedOptions,
                context,
                nameOptions,
                relatedOptions
            }),
        [assignedOptions, context, nameOptions, relatedOptions]
    );

    return {
        defaultLookups,
        lookupOptions: {
            assigned: assignedOptions,
            name: nameOptions,
            related: relatedOptions
        }
    };
}
