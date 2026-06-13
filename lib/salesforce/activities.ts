export type ActivityParentType = "account" | "contact";

export type ActivityParent = {
    parentType: ActivityParentType;
    parentId: string;
};

export type ActivityCreateParent = {
    parentType?: ActivityParentType;
    parentId?: string;
};

export type TaskActivityInput = ActivityCreateParent & {
    Subject: string;
    ActivityDate?: string;
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
    Status?: string;
    Priority?: string;
    TaskSubtype?: string;
    Description?: string;
};

export type TaskActivityUpdateInput = {
    ActivityDate?: string | null;
    Description?: string | null;
    OwnerId?: string | null;
    Priority?: string | null;
    Status?: string | null;
    Subject?: string | null;
    WhatId?: string | null;
    WhoId?: string | null;
};

export type EventActivityInput = ActivityCreateParent & {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    OwnerId?: string;
    WhoId?: string;
    WhatId?: string;
    Location?: string;
    Description?: string;
};

export type EventActivityUpdateInput = {
    Description?: string | null;
    EndDateTime?: string | null;
    Location?: string | null;
    OwnerId?: string | null;
    StartDateTime?: string | null;
    Subject?: string | null;
    WhatId?: string | null;
    WhoId?: string | null;
};

export type TaskActivityRecord = {
    Id: string;
    Subject?: string;
    ActivityDate?: string;
    Who?: {
        Name?: string;
    };
    WhoId?: string;
    Owner?: {
        Name?: string;
    };
    OwnerId?: string;
    What?: {
        Name?: string;
    };
    WhatId?: string;
    Status?: string;
    Priority?: string;
    TaskSubtype?: string;
    Description?: string;
    CreatedDate?: string;
    LastModifiedDate?: string;
};

export type EventActivityRecord = {
    Id: string;
    Subject?: string;
    StartDateTime?: string;
    EndDateTime?: string;
    Who?: {
        Name?: string;
    };
    WhoId?: string;
    Owner?: {
        Name?: string;
    };
    OwnerId?: string;
    What?: {
        Name?: string;
    };
    WhatId?: string;
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
        ownerId?: string;
        ownerName?: string;
        whatId?: string;
        whatName?: string;
        status?: string;
        priority?: string;
        taskSubtype?: string;
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
        whoId?: string;
        whoName?: string;
        ownerId?: string;
        ownerName?: string;
        whatId?: string;
        whatName?: string;
        location?: string;
        description?: string;
        createdDate?: string;
        lastModifiedDate?: string;
    };
