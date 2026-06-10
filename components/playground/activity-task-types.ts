import type { ActivityParentType } from "@/lib/salesforce/activities";

export type TaskForm = {
    Subject: string;
    ActivityDate: string;
    Status: string;
    Priority: string;
    TaskSubtype?: string;
    Description: string;
};

export type EventForm = {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    Location: string;
    Description: string;
};

export type TaskFormErrorKey = "assignedUserName" | "Status" | "Subject";
export type TaskFormErrors = Partial<Record<TaskFormErrorKey, string>>;
export type EventFormErrorKey = "assignedUserName" | "EndDateTime" | "StartDateTime" | "Subject";
export type EventFormErrors = Partial<Record<EventFormErrorKey, string>>;

export type ActivityOwnerObjectLabel = "ユーザー";
export type ActivityWhoObjectLabel = "リード" | "取引先責任者";
export type ActivityWhatObjectLabel = "ケース" | "商談" | "その他" | "取引先";
export type LookupObjectLabel = ActivityOwnerObjectLabel | ActivityWhoObjectLabel | ActivityWhatObjectLabel;
export type RemoteLookupObjectLabel = "ユーザー" | "取引先" | "取引先責任者";
export type ActivityLookupOption = {
    id: string;
    label: string;
    meta?: string;
    objectLabel: LookupObjectLabel;
};

export type ActivityLookupApiObject = "account" | "contact" | "user";
export type ActivityLookupApiOption = {
    id: string;
    label: string;
    meta?: string;
    object: ActivityLookupApiObject;
};
export type ActivityLookupApiResponse = {
    options: ActivityLookupApiOption[];
};

export type ActivityLookupState = {
    assigned?: ActivityLookupOption;
    name?: ActivityLookupOption;
    related?: ActivityLookupOption;
};

export type ActivityLookupPayload = {
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
};

export type ActivityRecordContext = {
    assignedUserName?: string;
    assignedUserId?: string;
    parentId: string;
    parentName: string;
    parentType: ActivityParentType;
    relatedId?: string;
    relatedName?: string;
};
