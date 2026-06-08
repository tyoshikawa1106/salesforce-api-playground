"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { ActivityParentType, ActivityTimelineItem } from "@/lib/salesforce/activities";
import { apiRequest } from "./api";
import { formatDate } from "./formatting";
import { StandardIcon, UtilityIcon } from "./SldsIcon";

type TaskForm = {
    Subject: string;
    ActivityDate: string;
    Status: string;
    Priority: string;
    Description: string;
};

type ActivityRecordContext = {
    parentId: string;
    parentName: string;
    parentType: ActivityParentType;
    relatedName?: string;
};

const defaultTaskForm: TaskForm = {
    Subject: "",
    ActivityDate: "",
    Status: "Not Started",
    Priority: "Normal",
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
    parentName,
    parentType,
    relatedContent,
    relatedName
}: ActivityRecordContext & {
    relatedContent?: ReactNode;
}) {
    const [activeTab, setActiveTab] = useState<"activity" | "related">("activity");
    const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);
    const [activityMessage, setActivityMessage] = useState("");
    const [taskForm, setTaskForm] = useState<TaskForm>(defaultTaskForm);
    const [composerOpen, setComposerOpen] = useState(false);
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
            parentId,
            parentName,
            parentType,
            relatedName
        }),
        [parentId, parentName, parentType, relatedName]
    );

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
            setComposerOpen(false);
            setActivityMessage("ToDo を作成しました。");
            await loadActivities();
        } catch (error) {
            setActivityMessage(error instanceof Error ? error.message : "ToDo の作成に失敗しました。");
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
                            loading={loadingActivities}
                            message={activityMessage}
                            taskForm={taskForm}
                            composerOpen={composerOpen}
                            saving={savingActivity}
                            onCloseComposer={() => setComposerOpen(false)}
                            onOpenComposer={() => setComposerOpen(true)}
                            onRefresh={loadActivities}
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
    composerOpen,
    context,
    loading,
    message,
    saving,
    taskForm,
    onCloseComposer,
    onOpenComposer,
    onRefresh,
    onSaveTask,
    onTaskFormChange
}: {
    activities: ActivityTimelineItem[];
    composerOpen: boolean;
    context: ActivityRecordContext;
    loading: boolean;
    message: string;
    saving: boolean;
    taskForm: TaskForm;
    onCloseComposer: () => void;
    onOpenComposer: () => void;
    onRefresh: () => void;
    onSaveTask: (event: FormEvent<HTMLFormElement>) => void;
    onTaskFormChange: (value: TaskForm) => void;
}) {
    return (
        <div className="playground-activity-panel">
            <ActivityComposerBar onOpenTask={onOpenComposer} />
            <ActivityTimelineToolbar loading={loading} onRefresh={onRefresh} />
            {message ? <p className="slds-text-color_weak slds-m-bottom_x-small">{message}</p> : null}
            {loading ? <p className="slds-text-color_weak slds-p-around_medium">活動を読み込んでいます...</p> : <ActivityTimeline activities={activities} context={context} />}
            {composerOpen ? (
                <TaskDockedComposer
                    context={context}
                    form={taskForm}
                    saving={saving}
                    onCancel={onCloseComposer}
                    onChange={onTaskFormChange}
                    onSubmit={onSaveTask}
                />
            ) : null}
        </div>
    );
}

function ActivityComposerBar({ onOpenTask }: { onOpenTask: () => void }) {
    return (
        <ul className="slds-button-group-row playground-activity-composer-bar" aria-label="活動作成">
            <li className="slds-button-group-item">
                <div className="slds-button-group" role="group" aria-label="新規ToDo">
                    <button className="slds-button slds-button_neutral playground-activity-composer-action" type="button" title="新規ToDo" onClick={onOpenTask}>
                        <span className="slds-icon_container slds-icon-standard-task playground-activity-composer-action__icon" title="新規ToDo">
                            <StandardIcon className="slds-icon slds-icon_x-small" name="task" />
                            <span className="slds-assistive-text">新規ToDo</span>
                        </span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-border-filled playground-activity-composer-action__menu" type="button" title="新規ToDoのその他の操作" disabled>
                        <UtilityIcon className="slds-button__icon" name="down" />
                        <span className="slds-assistive-text">新規ToDoのその他の操作</span>
                    </button>
                </div>
            </li>
        </ul>
    );
}

function ActivityTimelineToolbar({
    loading,
    onRefresh
}: {
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="playground-activity-toolbar">
            <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                <p className="slds-text-body_regular slds-text-color_weak playground-activity-filter">
                    条件: 常時・すべての活動・すべての種別
                </p>
                <button className="slds-button slds-button_icon slds-button_icon-border playground-activity-settings" type="button" title="活動設定">
                    <UtilityIcon className="slds-button__icon" name="settings" />
                    <span className="slds-assistive-text">活動設定</span>
                </button>
            </div>
            <div className="slds-text-align_right playground-activity-links">
                <button className="slds-button_reset slds-text-link" type="button" disabled={loading} onClick={() => void onRefresh()}>
                    更新
                </button>
                <span aria-hidden="true">・</span>
                <button className="slds-button_reset slds-text-link" type="button">
                    すべて展開
                </button>
                <span aria-hidden="true">・</span>
                <button className="slds-button_reset slds-text-link" type="button">
                    すべて表示
                </button>
            </div>
        </div>
    );
}

function ActivityTimeline({
    activities,
    context
}: {
    activities: ActivityTimelineItem[];
    context: ActivityRecordContext;
}) {
    return (
        <section className="playground-activity-timeline">
            <h3 className="slds-section__title playground-activity-section-title">
                <button className="slds-button slds-section__title-action playground-activity-section-title__content" type="button" aria-expanded="true">
                    <UtilityIcon className="slds-section__title-action-icon slds-button__icon slds-button__icon_left" name="switch" />
                    <span className="slds-truncate" title="今後 & 期限切れ">今後 &amp; 期限切れ</span>
                </button>
            </h3>
            {activities.length === 0 ? (
                <ActivityTimelineEmpty />
            ) : (
                <ul className="slds-timeline playground-activity-timeline__list">
                    {activities.map((activity) => (
                        <ActivityTimelineEntry activity={activity} context={context} key={`${activity.type}-${activity.id}`} />
                    ))}
                </ul>
            )}
            <ActivitySearchHint />
            <div className="slds-text-align_center slds-m-top_medium">
                <button className="slds-button slds-button_brand" type="button">
                    すべての活動を表示
                </button>
            </div>
        </section>
    );
}

function ActivityTimelineEmpty() {
    return (
        <div className="slds-p-vertical_small slds-text-align_center slds-text-color_weak playground-activity-empty">
            表示できる活動はまだありません。
        </div>
    );
}

function ActivityTimelineEntry({
    activity,
    context,
    preview = false
}: {
    activity: ActivityTimelineItem;
    context: ActivityRecordContext;
    preview?: boolean;
}) {
    const isTask = activity.type === "task";
    const date = isTask ? formatDate(activity.date) : formatDate(activity.startDateTime);
    const title = activity.subject || (isTask ? "ToDo" : "行動");
    const itemClassName = isTask ? "slds-timeline__item_task" : "slds-timeline__item_event";

    return (
        <li>
            <div className={`slds-timeline__item_expandable ${itemClassName} playground-activity-timeline-item`}>
                <span className="slds-assistive-text">{isTask ? "ToDo" : "行動"}</span>
                <div className="slds-media">
                    <div className="slds-media__figure">
                        <button className="slds-button slds-button_icon" type="button" aria-expanded="false" title={`${title} の詳細を表示`}>
                            <UtilityIcon className="slds-button__icon slds-timeline__details-action-icon" name="switch" />
                            <span className="slds-assistive-text">{title} の詳細を表示</span>
                        </button>
                        <span className={`slds-icon_container ${isTask ? "slds-icon-standard-task" : "slds-icon-standard-event"} slds-timeline__icon`} title={isTask ? "ToDo" : "行動"}>
                            <StandardIcon className="slds-icon slds-icon_small" name={isTask ? "task" : "event"} />
                            <span className="slds-assistive-text">{isTask ? "ToDo" : "行動"}</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <div className="slds-grid slds-grid_align-spread slds-timeline__trigger">
                            <div className="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                                {isTask ? (
                                    <span className="slds-checkbox playground-activity-checkbox">
                                        <input id={`activity-checkbox-${activity.id}`} type="checkbox" disabled={preview} />
                                        <label className="slds-checkbox__label" htmlFor={`activity-checkbox-${activity.id}`}>
                                            <span className="slds-checkbox_faux" />
                                            <span className="slds-form-element__label slds-assistive-text">完了としてマーク</span>
                                        </label>
                                    </span>
                                ) : null}
                                <h4 className="slds-truncate" title={title}>
                                    <a href="#" onClick={(event) => event.preventDefault()}>
                                        <strong>{title}</strong>
                                    </a>
                                </h4>
                            </div>
                            <div className="slds-timeline__actions slds-timeline__actions_inline">
                                <p className="slds-timeline__date">{date === "-" ? "期日なし" : date}</p>
                                <button className="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" type="button" title="その他の操作">
                                    <UtilityIcon className="slds-button__icon" name="down" />
                                    <span className="slds-assistive-text">その他の操作</span>
                                </button>
                            </div>
                        </div>
                        <p className="slds-m-horizontal_xx-small slds-text-body_small">
                            {isTask ? (
                                <>
                                    <a href="#" onClick={(event) => event.preventDefault()}>{context.parentName}</a>
                                    {" さんとの今後の ToDo"}
                                    {activity.status ? ` / ${activity.status}` : ""}
                                    {activity.priority ? ` / ${activity.priority}` : ""}
                                </>
                            ) : (
                                <>
                                    行動
                                    {activity.location ? ` / ${activity.location}` : ""}
                                </>
                            )}
                        </p>
                        {activity.description ? <p className="slds-m-horizontal_xx-small slds-m-top_xx-small">{activity.description}</p> : null}
                    </div>
                </div>
            </div>
        </li>
    );
}

function ActivitySearchHint() {
    return (
        <div className="slds-scoped-notification slds-media slds-media_center slds-theme_shade playground-activity-search-hint" role="status">
            <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-utility-info" title="情報">
                    <UtilityIcon className="slds-icon slds-icon_x-small slds-icon-text-default" name="help" />
                    <span className="slds-assistive-text">情報</span>
                </span>
            </div>
            <div className="slds-media__body">
                <p>表示する内容を変更するには、検索条件を変更してください。</p>
            </div>
        </div>
    );
}

function TaskDockedComposer({
    context,
    form,
    saving,
    onCancel,
    onChange,
    onSubmit
}: {
    context: ActivityRecordContext;
    form: TaskForm;
    saving: boolean;
    onCancel: () => void;
    onChange: (value: TaskForm) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <div className="slds-docked_container playground-activity-docked-container">
            <section
                className="slds-docked-composer slds-grid slds-grid_vertical slds-is-open playground-task-composer"
                role="dialog"
                aria-labelledby="new-task-composer-title"
                aria-describedby="new-task-composer-body"
            >
                <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                    <div className="slds-media slds-media_center slds-no-space">
                        <div className="slds-media__figure slds-m-right_x-small">
                            <span className="slds-icon_container slds-icon-standard-task" title="ToDo">
                                <StandardIcon className="slds-icon slds-icon_small" name="task" />
                                <span className="slds-assistive-text">ToDo</span>
                            </span>
                        </div>
                        <div className="slds-media__body">
                            <h2 className="slds-truncate" id="new-task-composer-title" title="新規ToDo">新規ToDo</h2>
                        </div>
                    </div>
                    <div className="slds-col_bump-left slds-shrink-none">
                        <button className="slds-button slds-button_icon" type="button" title="最小化">
                            <UtilityIcon className="slds-button__icon" name="minimize_window" />
                            <span className="slds-assistive-text">最小化</span>
                        </button>
                        <button className="slds-button slds-button_icon" type="button" title="拡大">
                            <UtilityIcon className="slds-button__icon" name="expand_alt" />
                            <span className="slds-assistive-text">拡大</span>
                        </button>
                        <button className="slds-button slds-button_icon" type="button" title="閉じる" onClick={onCancel}>
                            <UtilityIcon className="slds-button__icon" name="close" />
                            <span className="slds-assistive-text">閉じる</span>
                        </button>
                    </div>
                </header>
                <form className="slds-grid slds-grid_vertical slds-grow" onSubmit={onSubmit}>
                    <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound playground-task-composer__body" id="new-task-composer-body">
                        <legend className="slds-assistive-text">新規ToDo</legend>
                        <div className="slds-form-element__control">
                            <div className="slds-form-element__group">
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-1">
                                        <QuickActionInput
                                            icon="search"
                                            label="件名"
                                            required
                                            value={form.Subject}
                                            onChange={(Subject) => onChange({ ...form, Subject })}
                                        />
                                    </div>
                                </div>
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-2">
                                        <QuickActionInput
                                            icon="event"
                                            label="期日"
                                            type="date"
                                            value={form.ActivityDate}
                                            onChange={(ActivityDate) => onChange({ ...form, ActivityDate })}
                                        />
                                    </div>
                                    <div className="slds-form-element slds-size_1-of-2">
                                        <QuickActionInput label="割り当て先" required value="現在のユーザー" readOnly onChange={() => undefined} />
                                    </div>
                                </div>
                                <div className="slds-form-element__row">
                                    <LookupPreview label="名前" objectLabel="取引先責任者" placeholder="取引先責任者を検索..." value={context.parentType === "contact" ? context.parentName : ""} />
                                    <LookupPreview label="関連先" objectLabel="取引先" placeholder="取引先を検索..." value={context.parentType === "account" ? context.parentName : context.relatedName || ""} />
                                </div>
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-2">
                                        <QuickActionInput label="状況" value={form.Status} onChange={(Status) => onChange({ ...form, Status })} />
                                    </div>
                                    <div className="slds-form-element slds-size_1-of-2">
                                        <QuickActionInput label="優先度" value={form.Priority} onChange={(Priority) => onChange({ ...form, Priority })} />
                                    </div>
                                </div>
                                <div className="slds-form-element__row">
                                    <div className="slds-form-element slds-size_1-of-1">
                                        <QuickActionTextArea label="コメント" value={form.Description} onChange={(Description) => onChange({ ...form, Description })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <footer className="slds-docked-composer__footer slds-shrink-none">
                        <button className="slds-button slds-button_neutral" type="button" onClick={onCancel} disabled={saving}>
                            キャンセル
                        </button>
                        <button className="slds-button slds-button_brand slds-col_bump-left" type="submit" disabled={saving}>
                            保存
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

function QuickActionInput({
    icon,
    label,
    onChange,
    readOnly = false,
    required = false,
    type = "text",
    value
}: {
    icon?: "event" | "search";
    label: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
    type?: string;
    value: string;
}) {
    return (
        <>
            <span className="slds-form-element__label">{required ? <abbr className="slds-required" title="必須">*</abbr> : null}{label}</span>
            <span className="slds-form-element__control">
                <span className={icon ? "slds-input-has-icon slds-input-has-icon_right" : undefined}>
                    <input className="slds-input" type={type} readOnly={readOnly} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
                    {icon ? <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default" name={icon} /> : null}
                </span>
            </span>
        </>
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
        <>
            <span className="slds-form-element__label">{label}</span>
            <span className="slds-form-element__control">
                <textarea className="slds-textarea" value={value} onChange={(event) => onChange(event.target.value)} />
            </span>
        </>
    );
}

function LookupPreview({
    label,
    objectLabel,
    placeholder,
    value
}: {
    label: string;
    objectLabel: "取引先" | "取引先責任者";
    placeholder: string;
    value: string;
}) {
    const listboxId = objectLabel === "取引先" ? "task-related-account-listbox" : "task-name-contact-listbox";

    return (
        <div className="slds-form-element slds-size_1-of-2">
            <label className="slds-form-element__label">{label}</label>
            <div className="slds-form-element__control">
                {value ? (
                    <div className="slds-combobox_container slds-has-selection">
                        <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-controls={listboxId} aria-expanded="false" aria-haspopup="listbox" role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right" role="none">
                                <span className={`slds-icon_container ${objectLabel === "取引先" ? "slds-icon-standard-account" : "slds-icon-standard-contact"} slds-combobox__input-entity-icon`} title={objectLabel}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={objectLabel === "取引先" ? "account" : "contact"} />
                                    <span className="slds-assistive-text">{objectLabel}</span>
                                </span>
                                <input className="slds-input slds-combobox__input slds-combobox__input-value" type="text" role="textbox" readOnly value={value} />
                                <button className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" type="button" title={`${value} を削除`}>
                                    <UtilityIcon className="slds-button__icon" name="close" />
                                    <span className="slds-assistive-text">{value} を削除</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="slds-combobox_container">
                        <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click" aria-controls={listboxId} aria-expanded="false" aria-haspopup="listbox" role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                <input className="slds-input slds-combobox__input" type="text" role="textbox" placeholder={placeholder} readOnly />
                                <UtilityIcon className="slds-input__icon slds-input__icon_right slds-icon-text-default" name="search" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
