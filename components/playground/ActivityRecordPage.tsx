import type { ReactNode } from "react";
import { formatDate } from "./formatting";
import { DetailBlock } from "./RecordPageHeader";
import { RecordPageFrame } from "./RecordPageFrame";
import type { Activity } from "./types";

export function ActivityRecordPage({
    activity,
    loading,
    onDelete,
    onEdit,
    onOpenAccountById,
    onOpenContactById,
    onRefresh
}: {
    activity: Activity;
    loading: boolean;
    onDelete: (record: Activity) => void;
    onEdit: (record: Activity) => void;
    onOpenAccountById?: (accountId: string) => void;
    onOpenContactById?: (contactId: string) => void;
    onRefresh: () => void;
}) {
    const isTask = activity.type === "task";
    const objectLabel = isTask ? "ToDo" : "行動";
    const title = activity.subject || objectLabel;
    const whoLink = renderRecordLink(activity.whoName, activity.whoId, onOpenContactById);
    const whatLink = renderRecordLink(activity.whatName, activity.whatId, onOpenAccountById);
    const commonFields: Array<[string, ReactNode]> = [
        ["件名", title],
        ["名前", whoLink],
        ["関連先", whatLink],
        ["割り当て先", activity.ownerName],
    ];
    const detailFields = isTask
        ? [
            commonFields[0],
            ["期日", formatDate(activity.date)] as [string, ReactNode],
            ...commonFields.slice(1),
            ["状況", activity.status] as [string, ReactNode],
            ["説明", activity.description] as [string, ReactNode]
        ]
        : [
            commonFields[0],
            ["開始", formatDate(activity.startDateTime)] as [string, ReactNode],
            ["終了", formatDate(activity.endDateTime)] as [string, ReactNode],
            ...commonFields.slice(1),
            ["場所", activity.location] as [string, ReactNode],
            ["説明", activity.description] as [string, ReactNode]
        ];

    return (
        <RecordPageFrame
            record={activity}
            recordId={activity.id}
            tab="activities"
            objectLabel={objectLabel}
            title={title}
            includeActivityCard={false}
            loading={loading}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefresh={onRefresh}
            headerDetails={
                isTask ? (
                    <>
                        <DetailBlock label="期日" value={formatDate(activity.date) || "-"} />
                        <DetailBlock label="名前" value={whoLink || "-"} />
                        <DetailBlock label="関連先" value={whatLink || "-"} />
                        <DetailBlock label="割り当て先" value={activity.ownerName || "-"} />
                        <DetailBlock label="状況" value={activity.status || "-"} />
                    </>
                ) : (
                    <>
                        <DetailBlock label="開始" value={formatDate(activity.startDateTime) || "-"} />
                        <DetailBlock label="終了" value={formatDate(activity.endDateTime) || "-"} />
                        <DetailBlock label="名前" value={whoLink || "-"} />
                        <DetailBlock label="関連先" value={whatLink || "-"} />
                        <DetailBlock label="割り当て先" value={activity.ownerName || "-"} />
                    </>
                )
            }
            detailFields={detailFields}
            systemFields={[
                ["作成日", formatDate(activity.createdDate)],
                ["最終更新日", formatDate(activity.lastModifiedDate)]
            ]}
        />
    );
}

function renderRecordLink(
    label: string | undefined,
    id: string | undefined,
    onOpenRecord: ((id: string) => void) | undefined
) {
    if (!label) {
        return undefined;
    }

    if (!id || !onOpenRecord) {
        return label;
    }

    return (
        <button
            className="slds-button_reset slds-text-link"
            type="button"
            onClick={() => onOpenRecord(id)}
        >
            {label}
        </button>
    );
}
