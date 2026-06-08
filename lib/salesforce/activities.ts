export type ActivityParentType = "account" | "contact";

export type ActivityParent = {
    parentType: ActivityParentType;
    parentId: string;
};

export type TaskActivityInput = ActivityParent & {
    Subject: string;
    ActivityDate?: string;
    Status?: string;
    Priority?: string;
    Description?: string;
};

export type TaskActivityRecord = {
    Id: string;
    Subject?: string;
    ActivityDate?: string;
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
