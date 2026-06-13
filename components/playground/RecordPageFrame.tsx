"use client";

import { type ReactNode, useId, useState } from "react";
import type { ActivityLookupOption } from "./ActivityCard";
import { ActivityCard } from "./ActivityCard";
import { RecordFieldGrid } from "./RecordFieldGrid";
import { RecordPageHeader } from "./RecordPageHeader";
import { RecordMainTabs } from "./RecordMainTabs";
import { UtilityIcon } from "./SldsIcon";
import type { PicklistOption } from "./picklist-options";
import type { ActiveTab, Activity } from "./types";

type RecordPageFrameProps<Record extends object> = {
    record: Record;
    recordId?: string;
    tab: ActiveTab;
    objectLabel: string;
    title: string;
    activityRelatedName?: string;
    activityNameLookupOptions?: ActivityLookupOption[];
    onOpenActivity?: (activity: Activity) => void;
    activityRelatedLookupOptions?: ActivityLookupOption[];
    assignedUserId?: string;
    assignedUserName?: string;
    includeActivityCard?: boolean;
    loading: boolean;
    headerDetails: ReactNode;
    relatedContent?: ReactNode;
    detailFields: Array<[string, ReactNode]>;
    systemFields: Array<[string, ReactNode]>;
    taskStatusOptions?: PicklistOption[];
    onDeleteActivity?: (activity: Activity, afterDelete?: () => Promise<void> | void) => void;
    onEditActivity?: (activity: Activity) => void;
    onDelete: (record: Record) => void;
    onEdit: (record: Record) => void;
    onRefresh: () => void;
};

export function RecordPageFrame<Record extends object>({
    record,
    recordId,
    tab,
    objectLabel,
    title,
    activityRelatedName,
    activityNameLookupOptions,
    onOpenActivity,
    activityRelatedLookupOptions,
    assignedUserId,
    assignedUserName,
    includeActivityCard = true,
    loading,
    headerDetails,
    relatedContent,
    detailFields,
    systemFields,
    taskStatusOptions,
    onDeleteActivity,
    onEditActivity,
    onDelete,
    onEdit,
    onRefresh
}: RecordPageFrameProps<Record>) {
    const activityParentId = recordId ?? ("Id" in record && typeof record.Id === "string" ? record.Id : "");

    return (
        <div>
            <RecordPageHeader
                tab={tab}
                objectLabel={objectLabel}
                title={title}
                loading={loading}
                onDelete={() => onDelete(record)}
                onEdit={() => onEdit(record)}
                onRefresh={onRefresh}
            >
                {headerDetails}
            </RecordPageHeader>

            <div className={includeActivityCard ? "slds-grid slds-wrap slds-gutters_small slds-m-top_small" : "slds-m-top_small"}>
                <div className={includeActivityCard ? "slds-col slds-size_1-of-1 slds-large-size_8-of-12" : undefined}>
                    <RecordMainTabs
                        detailContent={
                            <>
                                <RecordFieldGrid fields={detailFields} />
                                <RecordDetailSection title="システム情報">
                                    <RecordFieldGrid fields={systemFields} />
                                </RecordDetailSection>
                            </>
                        }
                    />
                </div>
                {includeActivityCard ? (
                    <div className="slds-col slds-size_1-of-1 slds-large-size_4-of-12">
                        <ActivityCard
                            parentId={activityParentId}
                            parentName={title}
                            parentType={tab === "accounts" ? "account" : "contact"}
                            assignedUserId={assignedUserId}
                            assignedUserName={assignedUserName}
                            nameLookupOptions={activityNameLookupOptions}
                            onDeleteActivity={onDeleteActivity}
                            onEditActivity={onEditActivity}
                            onOpenActivity={onOpenActivity}
                            relatedContent={relatedContent}
                            relatedLookupOptions={activityRelatedLookupOptions}
                            relatedName={activityRelatedName}
                            taskStatusOptions={taskStatusOptions}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function RecordDetailSection({ title, children }: { title: string; children: ReactNode }) {
    const [open, setOpen] = useState(true);
    const contentId = useId();

    return (
        <section className={`slds-section slds-m-top_medium ${open ? "slds-is-open" : ""}`}>
            <h2 className="slds-section__title">
                <button
                    className="slds-button slds-section__title-action"
                    type="button"
                    aria-controls={contentId}
                    aria-expanded={open}
                    onClick={() => setOpen((current) => !current)}
                >
                    <UtilityIcon
                        className={`slds-section__title-action-icon slds-button__icon slds-button__icon_left playground-record-section-icon ${
                            open ? "" : "playground-record-section-icon_collapsed"
                        }`}
                        name="down"
                    />
                    <span className="slds-truncate" title={title}>{title}</span>
                </button>
            </h2>
            <div className="slds-section__content" id={contentId} hidden={!open}>
                {children}
            </div>
        </section>
    );
}
