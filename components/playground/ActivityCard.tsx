"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityParentType, ActivityTimelineItem } from "@/lib/salesforce/activities";
import { apiRequest } from "./api";
import { formatDate } from "./formatting";

type TaskForm = {
    Subject: string;
    ActivityDate: string;
    Status: string;
    Priority: string;
    Description: string;
};

type EventForm = {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    Location: string;
    Description: string;
};

const defaultTaskForm: TaskForm = {
    Subject: "",
    ActivityDate: "",
    Status: "Not Started",
    Priority: "Normal",
    Description: ""
};

const defaultEventForm: EventForm = {
    Subject: "",
    StartDateTime: "",
    EndDateTime: "",
    Location: "",
    Description: ""
};

function compactActivityPayload<T extends Record<string, string>>(form: T) {
    return Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
            const trimmed = value.trim();
            return [key, trimmed || undefined];
        })
    );
}

export function ActivityCard({
    parentId,
    parentType,
    relatedContent
}: {
    parentId: string;
    parentType: ActivityParentType;
    relatedContent?: ReactNode;
}) {
    const [activeTab, setActiveTab] = useState<"activity" | "related">("activity");
    const [activeComposer, setActiveComposer] = useState<"task" | "event">("task");
    const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);
    const [activityMessage, setActivityMessage] = useState("");
    const [taskForm, setTaskForm] = useState<TaskForm>(defaultTaskForm);
    const [eventForm, setEventForm] = useState<EventForm>(defaultEventForm);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [savingActivity, setSavingActivity] = useState(false);
    const hasRelatedContent = Boolean(relatedContent);
    const activityTabId = "activity-tab";
    const activityPanelId = "activity-panel";
    const relatedTabId = "activity-related-tab";
    const relatedPanelId = "activity-related-panel";
    const parentPayload = useMemo(() => ({ parentType, parentId }), [parentId, parentType]);

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

    async function saveTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!taskForm.Subject.trim()) {
            setActivityMessage("件名は必須です。");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityTasks, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactActivityPayload(taskForm)
                    }
                })
            );
            setTaskForm(defaultTaskForm);
            setActivityMessage("ToDo を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "ToDo の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    async function saveEvent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!eventForm.Subject.trim() || !eventForm.StartDateTime.trim() || !eventForm.EndDateTime.trim()) {
            setActivityMessage("件名、開始、終了は必須です。");
            return;
        }

        const startDate = new Date(eventForm.StartDateTime);
        const endDate = new Date(eventForm.EndDateTime);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            setActivityMessage("開始と終了は有効な日時を入力してください。");
            return;
        }

        setSavingActivity(true);
        try {
            await apiRequest(
                buildPlaygroundApiRequest(playgroundApiPaths.activityEvents, {
                    method: "POST",
                    body: {
                        ...parentPayload,
                        ...compactActivityPayload({
                            ...eventForm,
                            StartDateTime: startDate.toISOString(),
                            EndDateTime: endDate.toISOString()
                        })
                    }
                })
            );
            setEventForm(defaultEventForm);
            setActivityMessage("Event を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "Event の作成に失敗しました。");
        } finally {
            setSavingActivity(false);
        }
    }

    return (
        <section className="slds-card slds-card_boundary">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">活動</h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
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
                    className="slds-tabs_default__content slds-show slds-p-around_x-small"
                    role="tabpanel"
                    id={activeTab === "related" && hasRelatedContent ? relatedPanelId : activityPanelId}
                    aria-labelledby={activeTab === "related" && hasRelatedContent ? relatedTabId : activityTabId}
                >
                    {activeTab === "related" && hasRelatedContent ? (
                        relatedContent
                    ) : (
                        <ActivityPanel
                            activities={activities}
                            activeComposer={activeComposer}
                            eventForm={eventForm}
                            loading={loadingActivities}
                            message={activityMessage}
                            saving={savingActivity}
                            taskForm={taskForm}
                            onComposerChange={setActiveComposer}
                            onEventFormChange={setEventForm}
                            onRefresh={loadActivities}
                            onSaveEvent={saveEvent}
                            onSaveTask={saveTask}
                            onTaskFormChange={setTaskForm}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

function ActivityPanel({
    activities,
    activeComposer,
    eventForm,
    loading,
    message,
    saving,
    taskForm,
    onComposerChange,
    onEventFormChange,
    onRefresh,
    onSaveEvent,
    onSaveTask,
    onTaskFormChange
}: {
    activities: ActivityTimelineItem[];
    activeComposer: "task" | "event";
    eventForm: EventForm;
    loading: boolean;
    message: string;
    saving: boolean;
    taskForm: TaskForm;
    onComposerChange: (value: "task" | "event") => void;
    onEventFormChange: (value: EventForm) => void;
    onRefresh: () => void;
    onSaveEvent: (event: FormEvent<HTMLFormElement>) => void;
    onSaveTask: (event: FormEvent<HTMLFormElement>) => void;
    onTaskFormChange: (value: TaskForm) => void;
}) {
    return (
        <div>
            <div className="slds-tabs_default slds-tabs_card playground-activity-composer">
                <ul className="slds-tabs_default__nav" role="tablist">
                    <li className={`slds-tabs_default__item ${activeComposer === "task" ? "slds-is-active" : ""}`} role="presentation">
                        <button
                            className="slds-tabs_default__link slds-button_reset"
                            type="button"
                            role="tab"
                            aria-selected={activeComposer === "task"}
                            onClick={() => onComposerChange("task")}
                        >
                            ToDo
                        </button>
                    </li>
                    <li className={`slds-tabs_default__item ${activeComposer === "event" ? "slds-is-active" : ""}`} role="presentation">
                        <button
                            className="slds-tabs_default__link slds-button_reset"
                            type="button"
                            role="tab"
                            aria-selected={activeComposer === "event"}
                            onClick={() => onComposerChange("event")}
                        >
                            Event
                        </button>
                    </li>
                </ul>
                <div className="slds-tabs_default__content slds-show slds-p-around_small">
                    {activeComposer === "task" ? (
                        <TaskQuickActionForm form={taskForm} saving={saving} onChange={onTaskFormChange} onSubmit={onSaveTask} />
                    ) : (
                        <EventQuickActionForm form={eventForm} saving={saving} onChange={onEventFormChange} onSubmit={onSaveEvent} />
                    )}
                </div>
            </div>

            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-m-top_medium slds-m-bottom_x-small">
                <h3 className="slds-text-heading_small">活動タイムライン</h3>
                <button className="slds-button slds-button_neutral" type="button" disabled={loading} onClick={() => void onRefresh()}>
                    更新
                </button>
            </div>
            {message ? <p className="slds-text-color_weak slds-m-bottom_x-small">{message}</p> : null}
            {loading ? <p className="slds-text-color_weak">活動を読み込んでいます...</p> : <ActivityTimeline activities={activities} />}
        </div>
    );
}

function TaskQuickActionForm({
    form,
    saving,
    onChange,
    onSubmit
}: {
    form: TaskForm;
    saving: boolean;
    onChange: (value: TaskForm) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <form className="slds-box slds-theme_default playground-activity-quick-action" onSubmit={onSubmit}>
            <QuickActionInput label="件名" required value={form.Subject} onChange={(Subject) => onChange({ ...form, Subject })} />
            <QuickActionInput label="期日" type="date" value={form.ActivityDate} onChange={(ActivityDate) => onChange({ ...form, ActivityDate })} />
            <QuickActionInput label="状況" value={form.Status} onChange={(Status) => onChange({ ...form, Status })} />
            <QuickActionInput label="優先度" value={form.Priority} onChange={(Priority) => onChange({ ...form, Priority })} />
            <QuickActionTextArea label="コメント" value={form.Description} onChange={(Description) => onChange({ ...form, Description })} />
            <div className="slds-text-align_right">
                <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                    ToDo を保存
                </button>
            </div>
        </form>
    );
}

function EventQuickActionForm({
    form,
    saving,
    onChange,
    onSubmit
}: {
    form: EventForm;
    saving: boolean;
    onChange: (value: EventForm) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <form className="slds-box slds-theme_default playground-activity-quick-action" onSubmit={onSubmit}>
            <QuickActionInput label="件名" required value={form.Subject} onChange={(Subject) => onChange({ ...form, Subject })} />
            <QuickActionInput label="開始" required type="datetime-local" value={form.StartDateTime} onChange={(StartDateTime) => onChange({ ...form, StartDateTime })} />
            <QuickActionInput label="終了" required type="datetime-local" value={form.EndDateTime} onChange={(EndDateTime) => onChange({ ...form, EndDateTime })} />
            <QuickActionInput label="場所" value={form.Location} onChange={(Location) => onChange({ ...form, Location })} />
            <QuickActionTextArea label="説明" value={form.Description} onChange={(Description) => onChange({ ...form, Description })} />
            <div className="slds-text-align_right">
                <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                    Event を保存
                </button>
            </div>
        </form>
    );
}

function QuickActionInput({
    label,
    onChange,
    required = false,
    type = "text",
    value
}: {
    label: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    value: string;
}) {
    return (
        <label className="slds-form-element slds-m-bottom_x-small">
            <span className="slds-form-element__label">{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</span>
            <span className="slds-form-element__control">
                <input className="slds-input" type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
            </span>
        </label>
    );
}

function QuickActionTextArea({
    label,
    onChange,
    value
}: {
    label: string;
    onChange: (value: string) => void;
    value: string;
}) {
    return (
        <label className="slds-form-element slds-m-bottom_small">
            <span className="slds-form-element__label">{label}</span>
            <span className="slds-form-element__control">
                <textarea className="slds-textarea" value={value} onChange={(event) => onChange(event.target.value)} />
            </span>
        </label>
    );
}

function ActivityTimeline({ activities }: { activities: ActivityTimelineItem[] }) {
    if (activities.length === 0) {
        return (
            <div className="slds-illustration slds-illustration_small slds-p-around_medium">
                <div className="slds-text-align_center">
                    <h3 className="slds-text-heading_small">表示する活動はありません。</h3>
                    <p className="slds-text-color_weak slds-m-top_x-small">ToDo または Event を作成するとここに表示されます。</p>
                </div>
            </div>
        );
    }

    return (
        <ul className="slds-timeline">
            {activities.map((activity) => (
                <li className="slds-timeline__item" key={`${activity.type}-${activity.id}`}>
                    <span className={`slds-icon_container slds-icon-standard-${activity.type === "task" ? "task" : "event"} slds-timeline__icon`} aria-hidden="true" />
                    <div className="slds-media">
                        <div className="slds-media__body">
                            <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                                <h4 className="slds-truncate" title={activity.subject}>
                                    <span className="slds-text-link">{activity.subject}</span>
                                </h4>
                                <p className="slds-timeline__date">
                                    {activity.type === "event" ? formatDate(activity.startDateTime) : formatDate(activity.date)}
                                </p>
                            </div>
                            <p className="slds-text-body_small slds-text-color_weak">
                                {activity.type === "event"
                                    ? ["Event", activity.location].filter(Boolean).join(" / ")
                                    : ["ToDo", activity.status, activity.priority].filter(Boolean).join(" / ")}
                            </p>
                            {activity.description ? <p className="slds-m-top_xx-small">{activity.description}</p> : null}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
