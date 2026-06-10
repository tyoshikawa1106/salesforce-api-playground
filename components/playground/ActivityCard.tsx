"use client";

import { type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityTimelineItem } from "@/lib/salesforce/activities";
import { apiRequest } from "./api";
import {
    buildCalendarWeeks,
    buildActivityLookupPayload,
    buildDateValue,
    buildDefaultTaskLookups,
    compactActivityPayload,
    compactEventActivityPayload,
    compactLookupOptions,
    formatDateInputValue,
    buildDateTimeInputValue,
    getDateTimeDateValue,
    getDateTimeTimeValue,
    getCalendarBaseDate,
    getDefaultEventForm,
    getDefaultLoggedCallTaskForm,
    getDefaultTaskForm,
    getEventFormErrorLabels,
    getLookupApiObject,
    getLookupObjectLabel,
    getTaskFormErrorLabels,
    normalizeDateInputValue,
    normalizeTimeInputValue,
    taskSubjectOptions,
    timeOptions,
    type ActivityLookupApiResponse,
    type ActivityLookupOption,
    type ActivityLookupState,
    type ActivityRecordContext,
    type EventForm,
    type EventFormErrors,
    type LookupObjectLabel,
    type RemoteLookupObjectLabel,
    type TaskForm,
    type TaskFormErrors,
    validateEventForm,
    validateTaskForm,
    weekDayLabels
} from "./activity-task-form";
import {
    ActivityTimeline,
    groupActivityTimelineSections,
    type TaskStatusOverride
} from "./ActivityTimeline";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

export type { ActivityLookupOption } from "./activity-task-form";
export { ActivityTimeline } from "./ActivityTimeline";

type ActivityComposerKind = "call" | "event" | "task";
type ActivityComposerAction = {
    icon: "event" | "task";
    iconStyle: CSSProperties;
    label: string;
    onClick: () => void;
    value: string;
};

export function ActivityCard({
    assignedUserName,
    assignedUserId,
    nameLookupOptions = [],
    parentId,
    parentName,
    parentType,
    relatedId,
    relatedContent,
    relatedLookupOptions = [],
    relatedName,
    onDeleteActivity,
    onEditActivity,
    onOpenActivity
}: ActivityRecordContext & {
    nameLookupOptions?: ActivityLookupOption[];
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    relatedContent?: ReactNode;
    relatedLookupOptions?: ActivityLookupOption[];
}) {
    const [activeTab, setActiveTab] = useState<"activity" | "related">("activity");
    const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);
    const [activityMessage, setActivityMessage] = useState("");
    const [eventForm, setEventForm] = useState<EventForm>(() => getDefaultEventForm());
    const [eventFormErrors, setEventFormErrors] = useState<EventFormErrors>({});
    const [taskForm, setTaskForm] = useState<TaskForm>(() => getDefaultTaskForm());
    const [taskFormErrors, setTaskFormErrors] = useState<TaskFormErrors>({});
    const [activeComposer, setActiveComposer] = useState<ActivityComposerKind | null>(null);
    const [composerExpanded, setComposerExpanded] = useState(false);
    const [composerMinimized, setComposerMinimized] = useState(false);
    const [taskStatusOverrides, setTaskStatusOverrides] = useState<Record<string, TaskStatusOverride>>({});
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [savingActivity, setSavingActivity] = useState(false);
    const hasRelatedContent = Boolean(relatedContent);
    const activityTabId = "activity-tab";
    const activityPanelId = "activity-panel";
    const relatedTabId = "activity-related-tab";
    const relatedPanelId = "activity-related-panel";
    const parentPayload = useMemo(() => ({ parentType, parentId }), [parentId, parentType]);
    const context = useMemo(
        () => ({
            assignedUserName,
            assignedUserId,
            parentId,
            parentName,
            parentType,
            relatedId,
            relatedName
        }),
        [assignedUserId, assignedUserName, parentId, parentName, parentType, relatedId, relatedName]
    );
    const taskNameOptions = useMemo(() => compactLookupOptions(nameLookupOptions), [nameLookupOptions]);
    const taskRelatedOptions = useMemo(
        () =>
            compactLookupOptions([
                ...relatedLookupOptions,
                ...(parentType === "account" ? [{ id: parentId, label: parentName, objectLabel: "取引先" as const }] : []),
                ...(parentType === "contact" && relatedName ? [{ id: relatedId || relatedName, label: relatedName, objectLabel: "取引先" as const }] : [])
            ]),
        [parentId, parentName, parentType, relatedId, relatedLookupOptions, relatedName]
    );
    const taskAssignedOptions = useMemo(
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
    const defaultTaskLookups = useMemo(
        () =>
            buildDefaultTaskLookups({
                assignedOptions: taskAssignedOptions,
                context,
                nameOptions: taskNameOptions,
                relatedOptions: taskRelatedOptions
            }),
        [context, taskAssignedOptions, taskNameOptions, taskRelatedOptions]
    );
    const [activityLookups, setActivityLookups] = useState<ActivityLookupState>(() => defaultTaskLookups);

    const loadActivities = useCallback(async () => {
        setLoadingActivities(true);
        try {
            const data = await apiRequest<{ activities: ActivityTimelineItem[] }>({
                url: playgroundApiPaths.activities(parentType, parentId),
                init: {
                    headers: {
                        "content-type": "application/json"
                    }
                }
            });

            setActivities(data.activities);
            setTaskStatusOverrides({});
            setActivityMessage("");
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "活動を読み込めませんでした。");
        } finally {
            setLoadingActivities(false);
        }
    }, [parentId, parentType]);

    useEffect(() => {
        if (activeTab === "activity") {
            void loadActivities();
        }
    }, [activeTab, loadActivities]);

    function closeComposer() {
        setActiveComposer(null);
        setComposerExpanded(false);
        setComposerMinimized(false);
        setActivityLookups(defaultTaskLookups);
        setEventFormErrors({});
        setTaskFormErrors({});
    }

    function openComposer(composer: ActivityComposerKind) {
        setActivityLookups(defaultTaskLookups);
        setComposerMinimized(false);
        if (composer === "event") {
            setEventForm(getDefaultEventForm());
        } else {
            setTaskForm(composer === "call" ? getDefaultLoggedCallTaskForm() : getDefaultTaskForm());
        }
        setActiveComposer(composer);
    }

    function completeComposerSave(message: string) {
        closeComposer();
        setActivityMessage(message);
    }

    async function saveTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validateTaskForm(taskForm, activityLookups.assigned?.label);

        setTaskFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setActivityMessage("");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityTasks, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactActivityPayload(taskForm),
                        ...buildActivityLookupPayload(activityLookups)
                    }
                })
            );
            setTaskForm(getDefaultTaskForm());
            completeComposerSave(activeComposer === "call" ? "電話を記録しました。" : "ToDo を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "ToDo の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    async function toggleTaskCompleted(activity: Extract<ActivityTimelineItem, { type: "task" }>) {
        const override = taskStatusOverrides[activity.id];
        const currentStatus = override?.status ?? activity.status ?? "Not Started";
        const completed = currentStatus === "Completed";
        const previousStatus = override?.previousStatus ?? activity.status ?? "Not Started";
        const nextStatus = completed ? previousStatus : "Completed";

        setTaskStatusOverrides((current) => ({
            ...current,
            [activity.id]: {
                previousStatus,
                status: nextStatus
            }
        }));
        setActivityMessage("");

        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityTask(activity.id), {
                    method: "PATCH",
                    body: {
                        Status: nextStatus
                    }
                })
            );
        } catch (error) {
            setTaskStatusOverrides((current) => {
                const next = { ...current };
                delete next[activity.id];
                return next;
            });
            setActivityMessage(error instanceof Error ? error.message : "ToDo の状況更新に失敗しました。");
        }
    }

    async function saveEvent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validateEventForm(eventForm, activityLookups.assigned?.label);

        setEventFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setActivityMessage("");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityEvents, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactEventActivityPayload(eventForm),
                        ...buildActivityLookupPayload(activityLookups)
                    }
                })
            );
            setEventForm(getDefaultEventForm());
            completeComposerSave("行動を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "行動の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    return (
        <section className="slds-card slds-card_boundary playground-activity-card">
            <div className="slds-card__body slds-card__body_inner playground-activity-card__body">
                <div className="slds-tabs_default">
                    <ul className="slds-tabs_default__nav" role="tablist">
                        <li className={`slds-tabs_default__item ${activeTab === "activity" ? "slds-is-active" : ""}`} role="presentation">
                            <button
                                className="slds-tabs_default__link slds-button_reset"
                                type="button"
                                role="tab"
                                id={activityTabId}
                                aria-selected={activeTab === "activity"}
                                aria-controls={activityPanelId}
                                onClick={() => setActiveTab("activity")}
                            >
                                活動
                            </button>
                        </li>
                        {hasRelatedContent ? (
                            <li className={`slds-tabs_default__item ${activeTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                                <button
                                    className="slds-tabs_default__link slds-button_reset"
                                    type="button"
                                    role="tab"
                                    id={relatedTabId}
                                    aria-selected={activeTab === "related"}
                                    aria-controls={relatedPanelId}
                                    onClick={() => setActiveTab("related")}
                                >
                                    関連
                                </button>
                            </li>
                        ) : null}
                    </ul>
                </div>
                <div
                    className="slds-tabs_default__content slds-show playground-activity-card__panel"
                    role="tabpanel"
                    id={activeTab === "related" && hasRelatedContent ? relatedPanelId : activityPanelId}
                    aria-labelledby={activeTab === "related" && hasRelatedContent ? relatedTabId : activityTabId}
                >
                    {activeTab === "related" && hasRelatedContent ? (
                        relatedContent
                    ) : (
                        <ActivityPanel
                            activities={activities}
                            context={context}
                            taskStatusOverrides={taskStatusOverrides}
                            loading={loadingActivities}
                            message={activityMessage}
                            activeComposer={activeComposer}
                            eventForm={eventForm}
                            eventFormErrors={eventFormErrors}
                            taskForm={taskForm}
                            composerExpanded={composerExpanded}
                            composerMinimized={composerMinimized}
                            taskFormErrors={taskFormErrors}
                            saving={savingActivity}
                            onCloseComposer={closeComposer}
                            onOpenEventComposer={() => openComposer("event")}
                            onOpenTaskComposer={() => openComposer("task")}
                            onOpenCallComposer={() => openComposer("call")}
                            onRefresh={loadActivities}
                            onSaveEvent={saveEvent}
                            onSaveTask={saveTask}
                            onToggleTaskCompleted={toggleTaskCompleted}
                            onDeleteActivity={onDeleteActivity}
                            onEditActivity={onEditActivity}
                            onOpenActivity={onOpenActivity}
                            onEventFormChange={(value) => {
                                setEventForm(value);
                                setEventFormErrors({});
                            }}
                            onTaskFormChange={(value) => {
                                setTaskForm(value);
                                setTaskFormErrors({});
                            }}
                            lookupOptions={{
                                assigned: taskAssignedOptions,
                                name: taskNameOptions,
                                related: taskRelatedOptions
                            }}
                            lookups={activityLookups}
                            onLookupChange={(value) => {
                                setActivityLookups(value);
                                setEventFormErrors({});
                                setTaskFormErrors({});
                            }}
                            onToggleComposerExpanded={() => {
                                setComposerMinimized(false);
                                setComposerExpanded((current) => !current);
                            }}
                            onToggleComposerMinimized={() => {
                                setComposerExpanded(false);
                                setComposerMinimized((current) => !current);
                            }}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

function ActivityPanel({
    activeComposer,
    activities,
    composerExpanded,
    composerMinimized,
    context,
    eventForm,
    eventFormErrors,
    lookupOptions,
    lookups,
    loading,
    message,
    saving,
    taskStatusOverrides,
    taskForm,
    taskFormErrors,
    onCloseComposer,
    onEventFormChange,
    onLookupChange,
    onOpenEventComposer,
    onOpenCallComposer,
    onOpenTaskComposer,
    onRefresh,
    onSaveEvent,
    onSaveTask,
    onTaskFormChange,
    onToggleTaskCompleted,
    onDeleteActivity,
    onEditActivity,
    onOpenActivity,
    onToggleComposerExpanded,
    onToggleComposerMinimized
}: {
    activeComposer: ActivityComposerKind | null;
    activities: ActivityTimelineItem[];
    composerExpanded: boolean;
    composerMinimized: boolean;
    context: ActivityRecordContext;
    eventForm: EventForm;
    eventFormErrors: EventFormErrors;
    lookupOptions: {
        assigned: ActivityLookupOption[];
        name: ActivityLookupOption[];
        related: ActivityLookupOption[];
    };
    lookups: ActivityLookupState;
    loading: boolean;
    message: string;
    saving: boolean;
    taskStatusOverrides: Record<string, TaskStatusOverride>;
    taskForm: TaskForm;
    taskFormErrors: TaskFormErrors;
    onCloseComposer: () => void;
    onEventFormChange: (value: EventForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onOpenEventComposer: () => void;
    onOpenCallComposer: () => void;
    onOpenTaskComposer: () => void;
    onRefresh: () => void;
    onSaveEvent: (event: FormEvent<HTMLFormElement>) => void;
    onSaveTask: (event: FormEvent<HTMLFormElement>) => void;
    onTaskFormChange: (value: TaskForm) => void;
    onToggleTaskCompleted: (activity: Extract<ActivityTimelineItem, { type: "task" }>) => void;
    onDeleteActivity?: (activity: ActivityTimelineItem) => void;
    onEditActivity?: (activity: ActivityTimelineItem) => void;
    onOpenActivity?: (activity: ActivityTimelineItem) => void;
    onToggleComposerExpanded: () => void;
    onToggleComposerMinimized: () => void;
}) {
    const timelineSections = groupActivityTimelineSections(activities, taskStatusOverrides);
    const [expandedSectionKeys, setExpandedSectionKeys] = useState<Set<string>>(() => new Set());
    const [openActionActivityId, setOpenActionActivityId] = useState<string | null>(null);
    const allSectionsExpanded = timelineSections.length > 0
        && timelineSections.every((section) => expandedSectionKeys.has(section.key));

    function toggleAllTimelineSections() {
        setExpandedSectionKeys(allSectionsExpanded
            ? new Set()
            : new Set(timelineSections.map((section) => section.key)));
    }

    function toggleTimelineSection(key: string) {
        setExpandedSectionKeys((current) => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    return (
        <div className="playground-activity-panel">
            <ActivityComposerBar onOpenCall={onOpenCallComposer} onOpenEvent={onOpenEventComposer} onOpenTask={onOpenTaskComposer} />
            <ActivityTimelineToolbar
                allSectionsExpanded={allSectionsExpanded}
                loading={loading}
                sectionCount={timelineSections.length}
                onRefresh={onRefresh}
                onToggleAllSections={toggleAllTimelineSections}
            />
            {message ? <p className="slds-text-color_weak slds-m-bottom_x-small">{message}</p> : null}
            {loading ? (
                <p className="slds-text-color_weak slds-p-around_medium">活動を読み込んでいます...</p>
            ) : (
                <ActivityTimeline
                    context={context}
                    expandedSectionKeys={expandedSectionKeys}
                    sections={timelineSections}
                    taskStatusOverrides={taskStatusOverrides}
                    openActionActivityId={openActionActivityId}
                    onCloseActionMenu={() => setOpenActionActivityId(null)}
                    onDeleteActivity={onDeleteActivity}
                    onEditActivity={onEditActivity}
                    onToggleSection={toggleTimelineSection}
                    onToggleTaskCompleted={onToggleTaskCompleted}
                    onOpenActivity={onOpenActivity}
                    onToggleActionMenu={(activityId) =>
                        setOpenActionActivityId((currentActivityId) => (currentActivityId === activityId ? null : activityId))
                    }
                />
            )}
            {activeComposer === "task" ? (
                <TaskDockedComposer
                    errors={taskFormErrors}
                    expanded={composerExpanded}
                    form={taskForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    onCancel={onCloseComposer}
                    onChange={onTaskFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveTask}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
            {activeComposer === "call" ? (
                <TaskDockedComposer
                    errors={taskFormErrors}
                    expanded={composerExpanded}
                    form={taskForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    variant="call"
                    onCancel={onCloseComposer}
                    onChange={onTaskFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveTask}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
            {activeComposer === "event" ? (
                <EventDockedComposer
                    errors={eventFormErrors}
                    expanded={composerExpanded}
                    form={eventForm}
                    lookupOptions={lookupOptions}
                    lookups={lookups}
                    minimized={composerMinimized}
                    saving={saving}
                    onCancel={onCloseComposer}
                    onChange={onEventFormChange}
                    onLookupChange={onLookupChange}
                    onToggleMinimized={onToggleComposerMinimized}
                    onSubmit={onSaveEvent}
                    onToggleExpanded={onToggleComposerExpanded}
                />
            ) : null}
        </div>
    );
}

function ActivityComposerBar({
    onOpenCall,
    onOpenEvent,
    onOpenTask
}: {
    onOpenCall: () => void;
    onOpenEvent: () => void;
    onOpenTask: () => void;
}) {
    const taskIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(59, 167, 85))"
    } as CSSProperties;
    const eventIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(235, 112, 146))"
    } as CSSProperties;
    const callIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(84, 105, 141))"
    } as CSSProperties;

    const actions: ActivityComposerAction[] = [
        { icon: "task", iconStyle: callIconStyle, label: "電話を記録", onClick: onOpenCall, value: "LogCall" },
        { icon: "task", iconStyle: taskIconStyle, label: "新規ToDo", onClick: onOpenTask, value: "NewTask" },
        { icon: "event", iconStyle: eventIconStyle, label: "新規行動", onClick: onOpenEvent, value: "NewEvent" }
    ];

    return (
        <ul className="slds-button-group-row playground-activity-composer-bar" aria-label="活動作成">
            {actions.map((action) => (
                <li className="slds-button-group-item" key={action.value}>
                    <div className="slds-button-group fix_button-group-flexbox" role="group" aria-label={action.label} part="button-group">
                        <button className="slds-button slds-button_neutral playground-activity-composer-action" type="button" aria-label={action.label} title={action.label} value={action.value} onClick={action.onClick}>
                            <span className={`slds-icon-standard-${action.icon} slds-icon_container playground-activity-composer-action__icon`} title={action.label}>
                                <span className="playground-activity-composer-action__icon-boundary" style={action.iconStyle}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={action.icon} />
                                </span>
                                <span className="slds-assistive-text">{action.label}</span>
                            </span>
                            <span className="hidden playground-activity-composer-action__label" aria-hidden="true">{action.label}</span>
                        </button>
                        <button
                            className="slds-button slds-button_icon-border-filled fix-slds-button_icon-border-filled slds-button_last playground-activity-composer-action__menu"
                            type="button"
                            aria-expanded="false"
                            aria-haspopup="true"
                            title={`追加の ${action.label} アクションはありません`}
                            disabled
                        >
                            <UtilityIcon className="slds-button__icon" name="down" />
                            <span className="slds-assistive-text">追加の {action.label} アクションはありません</span>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function ActivityTimelineToolbar({
    allSectionsExpanded,
    loading,
    sectionCount,
    onRefresh,
    onToggleAllSections
}: {
    allSectionsExpanded: boolean;
    loading: boolean;
    sectionCount: number;
    onRefresh: () => void;
    onToggleAllSections: () => void;
}) {
    return (
        <div className="playground-activity-toolbar">
            <div className="slds-text-align_right playground-activity-links">
                <button className="slds-button_reset slds-text-link" type="button" disabled={loading} onClick={() => void onRefresh()}>
                    更新
                </button>
                <span aria-hidden="true">・</span>
                <button
                    className="slds-button_reset slds-text-link"
                    type="button"
                    disabled={loading || sectionCount === 0}
                    onClick={onToggleAllSections}
                >
                    {allSectionsExpanded ? "すべて折りたたむ" : "すべて展開"}
                </button>
            </div>
        </div>
    );
}

function EventDockedComposer({
    errors,
    expanded,
    form,
    lookupOptions,
    lookups,
    minimized,
    saving,
    onCancel,
    onChange,
    onLookupChange,
    onSubmit,
    onToggleExpanded,
    onToggleMinimized
}: {
    errors: EventFormErrors;
    expanded: boolean;
    form: EventForm;
    lookupOptions: {
        assigned: ActivityLookupOption[];
        name: ActivityLookupOption[];
        related: ActivityLookupOption[];
    };
    lookups: ActivityLookupState;
    minimized: boolean;
    saving: boolean;
    onCancel: () => void;
    onChange: (value: EventForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleExpanded: () => void;
    onToggleMinimized: () => void;
}) {
    const composerStateClass = minimized ? "slds-is-closed" : "slds-is-open";
    const minimizeTitle = minimized ? "復元" : "最小化";
    const expandTitle = expanded ? "復元" : "最大化";
    const composer = (
        <form
            className={`slds-docked-composer slds-grid slds-grid_vertical ${composerStateClass} playground-task-composer ${
                expanded ? "playground-task-composer_expanded" : ""
            }`}
            onSubmit={onSubmit}
            noValidate
            role="dialog"
            aria-labelledby="new-event-composer-title"
            aria-describedby="new-event-composer-body"
        >
            <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                <div className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure slds-m-right_x-small">
                        <span className="slds-icon_container" title="行動">
                            <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name="event" />
                            <span className="slds-assistive-text">行動</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-truncate" id="new-event-composer-title" title="新規行動">新規行動</h2>
                    </div>
                </div>
                <div className="slds-col_bump-left slds-shrink-none">
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-p-around_xx-small" type="button" title={minimizeTitle} onClick={onToggleMinimized}>
                        <UtilityIcon className="slds-button__icon" name="minimize_window" />
                        <span className="slds-assistive-text">{minimizeTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title={expandTitle} onClick={onToggleExpanded}>
                        <UtilityIcon className="slds-button__icon" name={expanded ? "contract_alt" : "expand_alt"} />
                        <span className="slds-assistive-text">{expandTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title="閉じる" onClick={onCancel}>
                        <UtilityIcon className="slds-button__icon" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                </div>
            </header>
            <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound slds-grow slds-shrink slds-scrollable_y playground-task-composer__body" id="new-event-composer-body">
                <legend className="slds-assistive-text">新規行動</legend>
                <EventFormErrorSummary errors={errors} />
                <div className="slds-form-element__control">
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <QuickActionSubjectCombobox
                                error={errors.Subject}
                                label="件名"
                                required
                                value={form.Subject}
                                onChange={(Subject) => onChange({ ...form, Subject })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionDateTimePicker
                                error={errors.StartDateTime}
                                label="開始"
                                required
                                idPrefix="event-start"
                                value={form.StartDateTime}
                                onChange={(StartDateTime) => onChange({ ...form, StartDateTime })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionDateTimePicker
                                error={errors.EndDateTime}
                                label="終了"
                                required
                                idPrefix="event-end"
                                value={form.EndDateTime}
                                onChange={(EndDateTime) => onChange({ ...form, EndDateTime })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                label="名前"
                                objectLabel="取引先責任者"
                                options={lookupOptions.name}
                                placeholder="取引先責任者を検索..."
                                value={lookups.name}
                                onChange={(name) => onLookupChange({ ...lookups, name })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                label="関連先"
                                objectLabel="取引先"
                                options={lookupOptions.related}
                                placeholder="取引先を検索..."
                                value={lookups.related}
                                onChange={(related) => onLookupChange({ ...lookups, related })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLookup
                                error={errors.assignedUserName}
                                label="割り当て先"
                                objectLabel="ユーザー"
                                options={lookupOptions.assigned}
                                placeholder="ユーザーを検索..."
                                required
                                value={lookups.assigned}
                                onChange={(assigned) => onLookupChange({ ...lookups, assigned })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionTextInput
                                label="場所"
                                value={form.Location}
                                onChange={(Location) => onChange({ ...form, Location })}
                            />
                        </div>
                        <div className="slds-form-element__row">
                            <QuickActionLongTextInput
                                label="説明"
                                value={form.Description}
                                onChange={(Description) => onChange({ ...form, Description })}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            <footer className="slds-docked-composer__footer slds-shrink-none slds-grid_align-end">
                <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                    保存
                </button>
            </footer>
        </form>
    );

    if (expanded) {
        return (
            <>
                <div className="slds-backdrop slds-backdrop_open playground-task-composer-backdrop" />
                <div className="playground-task-composer-modal">
                    {composer}
                </div>
            </>
        );
    }

    return (
        <div className="slds-docked_container playground-activity-docked-container">
            {composer}
        </div>
    );
}

function TaskDockedComposer({
    errors,
    expanded,
    form,
    lookupOptions,
    lookups,
    minimized,
    saving,
    variant = "task",
    onCancel,
    onChange,
    onLookupChange,
    onSubmit,
    onToggleExpanded,
    onToggleMinimized
}: {
    errors: TaskFormErrors;
    expanded: boolean;
    form: TaskForm;
    lookupOptions: {
        assigned: ActivityLookupOption[];
        name: ActivityLookupOption[];
        related: ActivityLookupOption[];
    };
    lookups: ActivityLookupState;
    minimized: boolean;
    saving: boolean;
    variant?: "call" | "task";
    onCancel: () => void;
    onChange: (value: TaskForm) => void;
    onLookupChange: (value: ActivityLookupState) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleExpanded: () => void;
    onToggleMinimized: () => void;
}) {
    const composerStateClass = minimized ? "slds-is-closed" : "slds-is-open";
    const minimizeTitle = minimized ? "復元" : "最小化";
    const expandTitle = expanded ? "復元" : "最大化";
    const isCallLog = variant === "call";
    const composerTitle = isCallLog ? "電話を記録" : "新規ToDo";
    const composer = (
        <form
            className={`slds-docked-composer slds-grid slds-grid_vertical ${composerStateClass} playground-task-composer ${
                expanded ? "playground-task-composer_expanded" : ""
            }`}
            onSubmit={onSubmit}
            noValidate
            role="dialog"
            aria-labelledby="new-task-composer-title"
            aria-describedby="new-task-composer-body"
        >
            <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                <div className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure slds-m-right_x-small">
                        <span className="slds-icon_container" title={composerTitle}>
                            <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name="task" />
                            <span className="slds-assistive-text">{composerTitle}</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-truncate" id="new-task-composer-title" title={composerTitle}>{composerTitle}</h2>
                    </div>
                </div>
                <div className="slds-col_bump-left slds-shrink-none">
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-p-around_xx-small" type="button" title={minimizeTitle} onClick={onToggleMinimized}>
                        <UtilityIcon className="slds-button__icon" name="minimize_window" />
                        <span className="slds-assistive-text">{minimizeTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title={expandTitle} onClick={onToggleExpanded}>
                        <UtilityIcon className="slds-button__icon" name={expanded ? "contract_alt" : "expand_alt"} />
                        <span className="slds-assistive-text">{expandTitle}</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title="閉じる" onClick={onCancel}>
                        <UtilityIcon className="slds-button__icon" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                </div>
            </header>
            <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound slds-grow slds-shrink slds-scrollable_y playground-task-composer__body" id="new-task-composer-body">
                <legend className="slds-assistive-text">{composerTitle}</legend>
                <TaskFormErrorSummary errors={errors} />
                <div className="slds-form-element__control">
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <QuickActionSubjectCombobox
                                error={errors.Subject}
                                label="件名"
                                required
                                value={form.Subject}
                                onChange={(Subject) => onChange({ ...form, Subject })}
                            />
                        </div>
                        {isCallLog ? null : (
                            <>
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-1">
                                        <QuickActionDatepicker
                                            label="期日"
                                            value={form.ActivityDate}
                                            onChange={(ActivityDate) => onChange({ ...form, ActivityDate })}
                                        />
                                    </div>
                                </div>
                                <div className="slds-form-element__row">
                                    <QuickActionLookup
                                        label="名前"
                                        objectLabel="取引先責任者"
                                        options={lookupOptions.name}
                                        placeholder="取引先責任者を検索..."
                                        value={lookups.name}
                                        onChange={(name) => onLookupChange({ ...lookups, name })}
                                    />
                                </div>
                                <div className="slds-form-element__row">
                                    <QuickActionLookup
                                        label="関連先"
                                        objectLabel="取引先"
                                        options={lookupOptions.related}
                                        placeholder="取引先を検索..."
                                        value={lookups.related}
                                        onChange={(related) => onLookupChange({ ...lookups, related })}
                                    />
                                </div>
                            </>
                        )}
                        {isCallLog && lookups.assigned ? null : (
                            <div className="slds-form-element__row">
                                <QuickActionLookup
                                    error={errors.assignedUserName}
                                    label="割り当て先"
                                    objectLabel="ユーザー"
                                    options={lookupOptions.assigned}
                                    placeholder="ユーザーを検索..."
                                    required
                                    value={lookups.assigned}
                                    onChange={(assigned) => onLookupChange({ ...lookups, assigned })}
                                />
                            </div>
                        )}
                        {isCallLog ? null : (
                            <div className="slds-form-element__row">
                                <QuickActionSelect
                                    error={errors.Status}
                                    label="状況"
                                    required
                                    value={form.Status}
                                    onChange={(Status) => onChange({ ...form, Status })}
                                />
                            </div>
                        )}
                        <div className="slds-form-element__row">
                            <QuickActionLongTextInput
                                label="説明"
                                value={form.Description}
                                onChange={(Description) => onChange({ ...form, Description })}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
            <footer className="slds-docked-composer__footer slds-shrink-none slds-grid_align-end">
                <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                    保存
                </button>
            </footer>
        </form>
    );

    if (expanded) {
        return (
            <>
                <div className="slds-backdrop slds-backdrop_open playground-task-composer-backdrop" />
                <div className="playground-task-composer-modal">
                    {composer}
                </div>
            </>
        );
    }

    return (
        <div className="slds-docked_container playground-activity-docked-container">
            {composer}
        </div>
    );
}

export function TaskFormErrorSummary({ errors }: { errors: TaskFormErrors }) {
    const errorLabels = getTaskFormErrorLabels(errors);

    if (errorLabels.length === 0) {
        return null;
    }

    return (
        <div className="playground-task-error-summary">
            <div className="slds-notify slds-notify_alert slds-alert_error playground-task-error-alert" role="alert">
                <span className="slds-assistive-text">エラー</span>
                <h2>このページのエラーを確認してください。</h2>
            </div>
            <p className="slds-text-color_error slds-m-top_small">
                次の必須項目を入力する必要があります: {errorLabels.join("、")}
            </p>
        </div>
    );
}

export function EventFormErrorSummary({ errors }: { errors: EventFormErrors }) {
    const errorLabels = getEventFormErrorLabels(errors);

    if (errorLabels.length === 0) {
        return null;
    }

    return (
        <div className="playground-task-error-summary">
            <div className="slds-notify slds-notify_alert slds-alert_error playground-task-error-alert" role="alert">
                <span className="slds-assistive-text">エラー</span>
                <h2>このページのエラーを確認してください。</h2>
            </div>
            <p className="slds-text-color_error slds-m-top_small">
                次の必須項目を入力する必要があります: {errorLabels.join("、")}
            </p>
        </div>
    );
}

export function QuickActionTextInput({
    error,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const inputId = `activity-text-${label}`;

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</label>
            <div className="slds-form-element__control">
                <input
                    className="slds-input"
                    id={inputId}
                    type="text"
                    aria-invalid={Boolean(error)}
                    maxLength={255}
                    required={required}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                <FieldError message={error} />
            </div>
        </div>
    );
}

export function QuickActionLongTextInput({
    label,
    onChange,
    value
}: {
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const inputId = `activity-long-text-${label}`;

    return (
        <div className="slds-form-element slds-size_1-of-1">
            <label className="slds-form-element__label" htmlFor={inputId}>{label}</label>
            <div className="slds-form-element__control">
                <textarea
                    className="slds-textarea playground-task-composer__textarea"
                    id={inputId}
                    maxLength={32000}
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    );
}

export function QuickActionDateTimePicker({
    error,
    idPrefix,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    idPrefix: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const dateValue = getDateTimeDateValue(value);
    const timeValue = getDateTimeTimeValue(value);

    function changeDate(nextDate: string) {
        onChange(buildDateTimeInputValue(nextDate, timeValue));
    }

    function changeTime(nextTime: string) {
        const normalizedTime = normalizeTimeInputValue(nextTime);
        onChange(buildDateTimeInputValue(dateValue, normalizedTime || nextTime));
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <fieldset className="slds-form-element__control" aria-invalid={Boolean(error)}>
                <legend className="slds-form-element__label">
                    {required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}
                </legend>
                <div className="slds-grid slds-gutters_x-small">
                    <div className="slds-col slds-size_2-of-3">
                        <QuickActionDatepicker
                            hideLabel
                            idPrefix={`${idPrefix}-date`}
                            label={`${label}日`}
                            value={dateValue}
                            onChange={changeDate}
                        />
                    </div>
                    <div className="slds-col slds-size_1-of-3">
                        <QuickActionTimepicker
                            idPrefix={`${idPrefix}-time`}
                            label={`${label}時刻`}
                            value={timeValue}
                            onChange={changeTime}
                        />
                    </div>
                </div>
                <FieldError message={error} />
            </fieldset>
        </div>
    );
}

function QuickActionTimepicker({
    idPrefix,
    label,
    onChange,
    value
}: {
    idPrefix: string;
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(() => Math.max(timeOptions.indexOf(value), 0));
    const inputId = `${idPrefix}-input`;
    const listboxId = `${idPrefix}-listbox`;
    const activeOptionId = `${listboxId}-option-${activeIndex}`;

    function selectTime(nextValue: string) {
        onChange(nextValue);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, timeOptions.length - 1));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open) {
            event.preventDefault();
            selectTime(timeOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div
            className={`slds-combobox_container slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                }
            }}
        >
            <label className="slds-form-element__label slds-assistive-text" htmlFor={inputId}>{label}</label>
            <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click">
                <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                    <input
                        className="slds-combobox__input slds-input"
                        id={inputId}
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-controls={listboxId}
                        aria-expanded={open}
                        aria-haspopup="listbox"
                        aria-activedescendant={open ? activeOptionId : undefined}
                        autoComplete="off"
                        value={value}
                        onChange={(event) => {
                            onChange(event.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                    />
                    <span className="slds-input__icon slds-input__icon_right slds-icon-text-default" aria-hidden="true">
                        <UtilityIcon className="slds-icon slds-icon_x-small" name="clock" />
                    </span>
                </div>
                {open ? (
                    <div className="slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-5" id={listboxId} role="listbox" aria-label={label}>
                        {timeOptions.map((option, index) => (
                            <div
                                className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${activeIndex === index ? "slds-has-focus" : ""}`}
                                id={`${listboxId}-option-${index}`}
                                key={option}
                                role="option"
                                aria-selected={value === option}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectTime(option);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span className="slds-media__body">
                                    <span title={option}>{option}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function QuickActionSubjectCombobox({
    error,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(1);
    const inputId = "task-subject-combobox-input";
    const listboxId = "task-subject-combobox-listbox";
    const activeOptionId = `${inputId}-${activeIndex}`;
    const shouldShowOptions = (nextValue: string) => nextValue === "" || taskSubjectOptions.includes(nextValue as (typeof taskSubjectOptions)[number]);

    function selectSubject(nextValue: string) {
        onChange(nextValue);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!shouldShowOptions(value)) {
                return;
            }
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, taskSubjectOptions.length - 1));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!shouldShowOptions(value)) {
                return;
            }
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open) {
            event.preventDefault();
            selectSubject(taskSubjectOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</label>
            <div className="slds-form-element__control">
                <div className="slds-combobox_container">
                    <div className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}>
                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <input
                                className="slds-combobox__input slds-input"
                                id={inputId}
                                type="text"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-controls={listboxId}
                                aria-expanded={open}
                                aria-haspopup="listbox"
                                aria-activedescendant={open ? activeOptionId : undefined}
                                aria-invalid={Boolean(error)}
                                aria-label={label}
                                autoComplete="off"
                                maxLength={255}
                                required={required}
                                value={value}
                                onBlur={() => setOpen(false)}
                                onChange={(event) => {
                                    const nextValue = event.target.value;
                                    onChange(nextValue);
                                    setOpen(shouldShowOptions(nextValue));
                                }}
                                onFocus={() => setOpen(shouldShowOptions(value))}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="slds-input__icon-group slds-input__icon-group_right">
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default slds-icon_x-small" name="search" />
                            </div>
                        </div>
                        <div className="slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7" id={listboxId} role="listbox" aria-label={label}>
                            {taskSubjectOptions.map((option, index) => {
                                const optionLabel = option || "--なし--";
                                const selected = value === option;
                                const active = activeIndex === index;

                                return (
                                    <div
                                        className={`slds-media slds-listbox__option slds-media_center slds-media_small slds-listbox__option_plain ${
                                            active ? "slds-has-focus" : ""
                                        }`}
                                        data-value={option}
                                        id={`${inputId}-${index}`}
                                        key={optionLabel}
                                        role="option"
                                        aria-checked={selected}
                                        aria-selected={selected}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            selectSubject(option);
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <span className="slds-media__figure slds-listbox__option-icon" />
                                        <span className="slds-media__body">
                                            <span title={optionLabel}>{optionLabel}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <FieldError message={error} />
            </div>
        </div>
    );
}

export function QuickActionDatepicker({
    hideLabel = false,
    idPrefix = "task-activity-date",
    label,
    onChange,
    value
}: {
    hideLabel?: boolean;
    idPrefix?: string;
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    const initialDate = getCalendarBaseDate(value);
    const [open, setOpen] = useState(false);
    const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
    const inputId = `${idPrefix}-input`;
    const formatHelpId = `${idPrefix}-format`;
    const calendarId = `${idPrefix}-calendar`;
    const yearId = `${idPrefix}-year`;
    const selectedValue = normalizeDateInputValue(value);
    const todayValue = buildDateValue(new Date());
    const displayDate = new Date(displayYear, displayMonth, 1);
    const yearOptions = Array.from({ length: 201 }, (_, index) => new Date().getFullYear() - 100 + index);

    function setVisibleMonth(nextDate: Date) {
        setDisplayYear(nextDate.getFullYear());
        setDisplayMonth(nextDate.getMonth());
    }

    function selectDate(nextDate: Date) {
        onChange(buildDateValue(nextDate));
        setVisibleMonth(nextDate);
        setOpen(false);
    }

    function handleInputChange(nextValue: string) {
        const normalized = normalizeDateInputValue(nextValue);
        onChange(normalized || nextValue);

        if (normalized) {
            setVisibleMonth(getCalendarBaseDate(normalized));
        }
    }

    return (
        <>
            <label className={`slds-form-element__label ${hideLabel ? "slds-assistive-text" : ""}`} htmlFor={inputId}>{label}</label>
            <div className="slds-form-element__control">
                <div
                    className={`slds-dropdown-trigger slds-dropdown-trigger_click slds-size_1-of-1 ${open ? "slds-is-open" : ""}`}
                    role="group"
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                            setOpen(false);
                        }
                    }}
                >
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_right">
                        <input
                            className="slds-input"
                            id={inputId}
                            type="text"
                            autoComplete="off"
                            aria-describedby={formatHelpId}
                            value={formatDateInputValue(value)}
                            onBlur={() => {
                                const normalized = normalizeDateInputValue(value);
                                if (normalized) {
                                    onChange(normalized);
                                }
                            }}
                            onChange={(event) => handleInputChange(event.target.value)}
                            onFocus={() => setOpen(true)}
                        />
                        <span className="slds-input__icon slds-input__icon_right slds-icon-text-default" aria-hidden="true">
                            <UtilityIcon className="slds-icon slds-icon_x-small" name="event" />
                        </span>
                    </div>
                    {open ? (
                        <div className="slds-datepicker slds-dropdown slds-dropdown_left playground-task-datepicker" id={calendarId} aria-hidden="false" aria-label={`日付ピッカー: ${displayMonth + 1}月`} role="dialog" tabIndex={-1}>
                            <div className="slds-datepicker__filter slds-grid">
                                <div className="slds-datepicker__filter_month slds-grid slds-grid_align-spread slds-grow">
                                    <div className="slds-align-middle">
                                        <button className="slds-button slds-button_icon slds-button_icon-container" type="button" title="先月" onMouseDown={(event) => event.preventDefault()} onClick={() => setVisibleMonth(new Date(displayYear, displayMonth - 1, 1))}>
                                            <UtilityIcon className="slds-button__icon" name="left" />
                                            <span className="slds-assistive-text">先月</span>
                                        </button>
                                    </div>
                                    <h2 className="slds-align-middle" aria-live="polite">{displayMonth + 1}月</h2>
                                    <div className="slds-align-middle">
                                        <button className="slds-button slds-button_icon slds-button_icon-container" type="button" title="来月" onMouseDown={(event) => event.preventDefault()} onClick={() => setVisibleMonth(new Date(displayYear, displayMonth + 1, 1))}>
                                            <UtilityIcon className="slds-button__icon" name="right" />
                                            <span className="slds-assistive-text">来月</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="slds-shrink-none">
                                    <label className="slds-form-element__label slds-assistive-text" htmlFor={yearId}>年の取得</label>
                                    <div className="slds-select_container">
                                        <select className="slds-select playground-task-datepicker__year" id={yearId} value={displayYear} onChange={(event) => setDisplayYear(Number(event.target.value))}>
                                            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <table className="slds-datepicker__month" role="grid">
                                <thead>
                                    <tr>
                                        {weekDayLabels.map((dayLabel) => (
                                            <th key={dayLabel} scope="col">
                                                <abbr title={`${dayLabel}曜日`}>{dayLabel}</abbr>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {buildCalendarWeeks(displayDate).map((week) => (
                                        <tr key={week.map(buildDateValue).join("-")}>
                                            {week.map((date) => {
                                                const dateValue = buildDateValue(date);
                                                const selected = selectedValue === dateValue;
                                                const today = todayValue === dateValue;
                                                const adjacentMonth = date.getMonth() !== displayMonth;
                                                const classNames = [
                                                    adjacentMonth ? "slds-day_adjacent-month" : "",
                                                    selected ? "slds-is-selected" : "",
                                                    today ? "slds-is-today" : ""
                                                ].filter(Boolean).join(" ");

                                                return (
                                                    <td className={classNames || undefined} key={dateValue} role="gridcell" aria-current={today ? "date" : "false"} aria-label={dateValue} aria-selected={selected} data-value={dateValue}>
                                                        <span className="slds-day" role="button" tabIndex={selected ? 0 : -1} onMouseDown={(event) => event.preventDefault()} onClick={() => selectDate(date)}>{date.getDate()}</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="slds-button slds-align_absolute-center slds-text-link" name="today" type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectDate(new Date())}>今日</button>
                        </div>
                    ) : null}
                </div>
                <div className="slds-form-element__help slds-assistive-text" id={formatHelpId}>形式: 2024/12/31</div>
            </div>
        </>
    );
}

export function QuickActionSelect({
    error,
    label,
    onChange,
    required = false,
    value
}: {
    error?: string;
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    value: string;
}) {
    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <span className="slds-form-element__label">{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</span>
            <span className="slds-form-element__control">
                <span className="slds-select_container">
                    <select className="slds-select" required={required} aria-invalid={Boolean(error)} value={value} onChange={(event) => onChange(event.target.value)}>
                        <option value="">--なし--</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Waiting on someone else">Waiting on someone else</option>
                        <option value="Deferred">Deferred</option>
                    </select>
                </span>
            </span>
            <FieldError message={error} />
        </div>
    );
}

export function QuickActionLookup({
    error,
    label,
    objectLabel,
    onChange,
    options,
    placeholder,
    required = false,
    value
}: {
    error?: string;
    label: string;
    objectLabel: RemoteLookupObjectLabel;
    onChange: (value: ActivityLookupOption | undefined) => void;
    options: ActivityLookupOption[];
    placeholder: string;
    required?: boolean;
    value?: ActivityLookupOption;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [remoteMessage, setRemoteMessage] = useState("");
    const [remoteOptions, setRemoteOptions] = useState<ActivityLookupOption[] | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const requestIdRef = useRef(0);
    const lookupObject = getLookupApiObject(objectLabel);
    const { iconClassName, iconName } = getLookupIconMeta(objectLabel);
    const availableOptions = remoteOptions ?? options;
    const filteredOptions = availableOptions.filter((option) => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return true;
        }

        return [option.label, option.meta].some((text) => text?.toLowerCase().includes(normalizedQuery));
    });
    const listboxId = objectLabel === "取引先" ? "task-related-account-listbox" : objectLabel === "取引先責任者" ? "task-name-contact-listbox" : "task-assigned-user-listbox";
    const inputId = `${listboxId}-input`;
    const activeOptionId = filteredOptions[activeIndex] ? `${listboxId}-option-${filteredOptions[activeIndex].id}` : undefined;

    useEffect(() => {
        if (!open || value) {
            return;
        }

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoadingOptions(true);
        setRemoteMessage("");

        const timeoutId = window.setTimeout(() => {
            apiRequest<ActivityLookupApiResponse>(
                buildPlaygroundApiRequest(playgroundApiPaths.activityLookups(lookupObject, query))
            )
                .then((data) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions(data.options.map((option) => ({
                        id: option.id,
                        label: option.label,
                        meta: option.meta,
                        objectLabel: getLookupObjectLabel(option.object)
                    })));
                })
                .catch((error) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions([]);
                    setRemoteMessage(error instanceof Error ? error.message : "候補を取得できませんでした。");
                })
                .finally(() => {
                    if (requestIdRef.current === requestId) {
                        setLoadingOptions(false);
                    }
                });
        }, query.trim() ? 250 : 0);

        return () => window.clearTimeout(timeoutId);
    }, [lookupObject, open, query, value]);

    useEffect(() => {
        setActiveIndex((current) => Math.min(current, Math.max(filteredOptions.length - 1, 0)));
    }, [filteredOptions.length]);

    function selectOption(option: ActivityLookupOption) {
        onChange(option);
        setQuery("");
        setOpen(false);
    }

    function clearValue() {
        onChange(undefined);
        setQuery("");
        setActiveIndex(0);
        setRemoteOptions(null);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open && filteredOptions[activeIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className={`slds-form-element slds-size_1-of-1 ${error ? "slds-has-error" : ""}`}>
            <label className="slds-form-element__label" htmlFor={inputId}>{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</label>
            <div className="slds-form-element__control">
                {value ? (
                    <div className="slds-combobox_container slds-has-selection">
                        <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-controls={listboxId} aria-expanded="false" aria-haspopup="listbox" role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${iconClassName} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input className="slds-input slds-combobox__input slds-combobox__input-value" id={inputId} type="text" role="textbox" readOnly aria-invalid={Boolean(error)} value={value.label} />
                                <button className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" type="button" title={`${value.label} を削除`} onClick={clearValue}>
                                    <UtilityIcon className="slds-button__icon" name="close" />
                                    <span className="slds-assistive-text">{value.label} を削除</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="slds-combobox_container">
                        <div
                            className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
                            aria-controls={listboxId}
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            role="combobox"
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) {
                                    setOpen(false);
                                }
                            }}
                        >
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${iconClassName} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input
                                    className="slds-input slds-combobox__input playground-task-lookup__input"
                                    id={inputId}
                                    type="text"
                                    role="combobox"
                                    aria-activedescendant={open ? activeOptionId : undefined}
                                    aria-autocomplete="list"
                                    aria-controls={listboxId}
                                    aria-expanded={open}
                                    aria-haspopup="listbox"
                                    placeholder={placeholder}
                                    autoComplete="off"
                                    aria-invalid={Boolean(error)}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setActiveIndex(0);
                                        setOpen(true);
                                    }}
                                    onClick={() => setOpen(true)}
                                    onFocus={() => setOpen(true)}
                                    onKeyDown={handleKeyDown}
                                />
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default" name="search" />
                            </div>
                            {open ? (
                                <div className="slds-dropdown slds-dropdown_fluid slds-dropdown_left slds-dropdown_length-with-icon-7" id={listboxId} role="listbox" aria-label={label}>
                                    <ul className="slds-listbox slds-listbox_vertical" role="presentation">
                                        {loadingOptions ? (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option" aria-disabled="true" aria-selected="false">
                                                    <span className="slds-media__body">
                                                        <span className="slds-listbox__option-text">候補を読み込んでいます...</span>
                                                    </span>
                                                </div>
                                            </li>
                                        ) : null}
                                        {!loadingOptions && filteredOptions.length > 0 ? filteredOptions.map((option, index) => {
                                            const optionIcon = getLookupIconMeta(option.objectLabel);

                                            return (
                                                <li className="slds-listbox__item" key={`${option.objectLabel}-${option.id}`} role="presentation">
                                                    <div
                                                        className={`slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta ${
                                                            index === activeIndex ? "slds-has-focus" : ""
                                                        }`}
                                                        id={`${listboxId}-option-${option.id}`}
                                                        role="option"
                                                        aria-selected={index === activeIndex}
                                                        onMouseDown={(event) => {
                                                            event.preventDefault();
                                                            selectOption(option);
                                                        }}
                                                        onMouseEnter={() => setActiveIndex(index)}
                                                    >
                                                        <span className="slds-media__figure slds-listbox__option-icon">
                                                            <span className={`slds-icon_container ${optionIcon.iconClassName}`} title={option.objectLabel}>
                                                                <StandardIcon className="slds-icon slds-icon_small" name={optionIcon.iconName} />
                                                                <span className="slds-assistive-text">{option.objectLabel}</span>
                                                            </span>
                                                        </span>
                                                        <span className="slds-media__body">
                                                            <span className="slds-listbox__option-text slds-listbox__option-text_entity">{option.label}</span>
                                                            {option.meta ? <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">{option.meta}</span> : null}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        }) : null}
                                        {!loadingOptions && filteredOptions.length === 0 ? (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option" aria-disabled="true" aria-selected="false">
                                                    <span className="slds-media__body">
                                                        <span className="slds-listbox__option-text">{remoteMessage || "一致する候補はありません。"}</span>
                                                    </span>
                                                </div>
                                            </li>
                                        ) : null}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
                <FieldError message={error} />
            </div>
        </div>
    );
}

function getLookupIconMeta(objectLabel: LookupObjectLabel) {
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

function FieldError({ message }: { message?: string }) {
    return message ? <div className="slds-form-element__help">{message}</div> : null;
}
