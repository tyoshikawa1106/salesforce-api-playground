export type ActivityParentType = "account" | "contact";

export type ActivityParent = {
    parentType: ActivityParentType;
    parentId: string;
};

export type TaskActivityInput = ActivityParent & {
    Subject: string;
    ActivityDate?: string;
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
    Status?: string;
    Priority?: string;
    Description?: string;
};

export type TaskActivityUpdateInput = {
    Status?: string;
};

export type EventActivityInput = ActivityParent & {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
    Location?: string;
    Description?: string;
};

export type TaskActivityRecord = {
    Id: string;
    Subject?: string;
    ActivityDate?: string;
    Who?: {
        Name?: string;
    };
    WhoId?: string;
    What?: {
        Name?: string;
    };
    WhatId?: string;
    Status?: string;
    Priority?: string;
    Description?: string;
    CreatedDate?: string;
    LastModifiedDate?: string;
};

export type EventActivityRecord = {
    Id: string;
    Subject?: string;
    StartDateTime?: string;
    EndDateTime?: string;
    Location?: string;
    Description?: string;
    CreatedDate?: string;
    LastModifiedDate?: string;
};

export type ActivityTimelineItem =
    | {
        type: "task";
        id: string;
        subject: string;
        date?: string;
        whoId?: string;
        whoName?: string;
        whatId?: string;
        whatName?: string;
        status?: string;
        priority?: string;
        description?: string;
        createdDate?: string;
        lastModifiedDate?: string;
    }
    | {
        type: "event";
        id: string;
        subject: string;
        startDateTime?: string;
        endDateTime?: string;
        location?: string;
        description?: string;
        createdDate?: string;
        lastModifiedDate?: string;
    };
