import { type FormEvent, useEffect, useState } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    EventFormErrorSummary,
    QuickActionDatepicker,
    QuickActionDateTimePicker,
    QuickActionFormGroup,
    QuickActionFormRow,
    QuickActionLongTextInput,
    QuickActionSelect,
    QuickActionSubjectCombobox,
    QuickActionTextInput,
    TaskFormErrorSummary
} from "./ActivityQuickActionFields";
import {
    ActivityLookupRow,
    EventDockedComposer,
    TaskDockedComposer,
    type ActivityLookupOptions
} from "./ActivityDockedComposers";
import { validateEventForm, validateTaskForm } from "./activity-task-form";
import {
    AccountFormFields,
    ContactFormFields
} from "./Forms";
import { Modal, ModalFooter } from "./Modal";
import type { PicklistOption, PicklistOptionsByField } from "./picklist-options";
import type { Account, DeleteState, ModalState, RestoreState } from "./types";

type RecordModalsProps = {
    forms: {
        accountForm: AccountForm;
        accountOptions: Account[];
        activityLookups: ActivityLookupState;
        contactForm: ContactForm;
        eventForm: EventForm;
        taskForm: TaskForm;
        onAccountFormChange: (value: AccountForm) => void;
        onActivityLookupsChange: (value: ActivityLookupState) => void;
        onContactFormChange: (value: ContactForm) => void;
        onEventFormChange: (value: EventForm) => void;
        onTaskFormChange: (value: TaskForm) => void;
    };
    state: {
        deleteState: DeleteState | null;
        modal: ModalState | null;
        restoreState: RestoreState | null;
        saving: boolean;
    };
    picklists?: {
        accountError?: string;
        accountLoading?: boolean;
        accountOptions?: PicklistOptionsByField<"Industry" | "Type">;
        taskStatusOptions?: PicklistOption[];
    };
    actions: {
        onCancelDelete: () => void;
        onCancelRestore: () => void;
        onCloseRecordModal: () => void;
        onConfirmDelete: () => void;
        onConfirmRestore: () => void;
        onSaveAccount: (event: FormEvent<HTMLFormElement>) => void;
        onSaveActivity: (event: FormEvent<HTMLFormElement>) => void;
        onSaveContact: (event: FormEvent<HTMLFormElement>) => void;
    };
};

function ActivityEditLookupRows({
    assignedError,
    activityLookupOptions,
    activityLookups,
    onActivityLookupsChange
}: {
    assignedError?: string;
    activityLookupOptions: ActivityLookupOptions;
    activityLookups: ActivityLookupState;
    onActivityLookupsChange: (value: ActivityLookupState) => void;
}) {
    return (
        <>
            <ActivityLookupRow field="name" lookupOptions={activityLookupOptions} lookups={activityLookups} onLookupChange={onActivityLookupsChange} />
            <ActivityLookupRow field="related" lookupOptions={activityLookupOptions} lookups={activityLookups} onLookupChange={onActivityLookupsChange} />
            <ActivityLookupRow error={assignedError} field="assigned" lookupOptions={activityLookupOptions} lookups={activityLookups} required onLookupChange={onActivityLookupsChange} />
        </>
    );
}

function ActivityEditDescriptionRow({
    value,
    onChange
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <QuickActionFormRow>
            <QuickActionLongTextInput label="説明" value={value} onChange={onChange} />
        </QuickActionFormRow>
    );
}

export function RecordModals({
    forms,
    state,
    picklists,
    actions
}: RecordModalsProps) {
    const [activityComposerExpanded, setActivityComposerExpanded] = useState(false);
    const [activityComposerMinimized, setActivityComposerMinimized] = useState(false);
    const [showActivityValidation, setShowActivityValidation] = useState(false);
    const {
        accountForm,
        accountOptions,
        activityLookups,
        contactForm,
        eventForm,
        taskForm,
        onAccountFormChange,
        onActivityLookupsChange,
        onContactFormChange,
        onEventFormChange,
        onTaskFormChange
    } = forms;
    const { deleteState, modal, restoreState, saving } = state;
    const activityLookupOptions: ActivityLookupOptions = {
        assigned: activityLookups.assigned ? [activityLookups.assigned] : [],
        name: activityLookups.name ? [activityLookups.name] : [],
        related: activityLookups.related ? [activityLookups.related] : []
    };
    const taskErrors = showActivityValidation ? validateTaskForm(taskForm, activityLookups.assigned?.label) : {};
    const eventErrors = showActivityValidation ? validateEventForm(eventForm, activityLookups.assigned?.label) : {};
    const activityModalType = modal?.type === "activity"
        ? modal.mode === "create" ? modal.activityType : modal.record.type
        : null;
    const activityModalLabel = activityModalType === "task" ? "ToDo" : "行動";

    useEffect(() => {
        setActivityComposerExpanded(false);
        setActivityComposerMinimized(false);
        setShowActivityValidation(false);
    }, [modal]);

    function saveActivity(event: FormEvent<HTMLFormElement>) {
        setShowActivityValidation(true);
        actions.onSaveActivity(event);
    }

    return (
        <>
            {modal?.type === "account" ? (
                <Modal title={modal.mode === "create" ? "新規取引先" : "取引先を編集"} onClose={actions.onCloseRecordModal}>
                    <form onSubmit={actions.onSaveAccount} noValidate>
                        <div className="slds-modal__content slds-p-around_medium">
                            <AccountFormFields
                                loadingPicklists={picklists?.accountLoading}
                                picklistError={picklists?.accountError}
                                picklistOptions={picklists?.accountOptions}
                                value={accountForm}
                                onChange={onAccountFormChange}
                            />
                        </div>
                        <ModalFooter saving={saving} onCancel={actions.onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "contact" ? (
                <Modal title={modal.mode === "create" ? "新規取引先責任者" : "取引先責任者を編集"} onClose={actions.onCloseRecordModal}>
                    <form onSubmit={actions.onSaveContact} noValidate>
                        <div className="slds-modal__content slds-p-around_medium">
                            <ContactFormFields value={contactForm} accounts={accountOptions} onChange={onContactFormChange} />
                        </div>
                        <ModalFooter saving={saving} onCancel={actions.onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "activity" && modal.mode === "create" && activityModalType === "task" ? (
                <TaskDockedComposer
                    errors={taskErrors}
                    expanded={activityComposerExpanded}
                    form={taskForm}
                    lookupOptions={activityLookupOptions}
                    lookups={activityLookups}
                    minimized={activityComposerMinimized}
                    saving={saving}
                    statusOptions={picklists?.taskStatusOptions}
                    onCancel={actions.onCloseRecordModal}
                    onChange={onTaskFormChange}
                    onLookupChange={onActivityLookupsChange}
                    onSubmit={saveActivity}
                    onToggleExpanded={() => setActivityComposerExpanded((expanded) => !expanded)}
                    onToggleMinimized={() => setActivityComposerMinimized((minimized) => !minimized)}
                />
            ) : null}

            {modal?.type === "activity" && modal.mode === "create" && activityModalType === "event" ? (
                <EventDockedComposer
                    errors={eventErrors}
                    expanded={activityComposerExpanded}
                    form={eventForm}
                    lookupOptions={activityLookupOptions}
                    lookups={activityLookups}
                    minimized={activityComposerMinimized}
                    saving={saving}
                    onCancel={actions.onCloseRecordModal}
                    onChange={onEventFormChange}
                    onLookupChange={onActivityLookupsChange}
                    onSubmit={saveActivity}
                    onToggleExpanded={() => setActivityComposerExpanded((expanded) => !expanded)}
                    onToggleMinimized={() => setActivityComposerMinimized((minimized) => !minimized)}
                />
            ) : null}

            {modal?.type === "activity" && modal.mode === "edit" ? (
                <Modal title={`${activityModalLabel}を編集`} onClose={actions.onCloseRecordModal}>
                    <form onSubmit={saveActivity} noValidate>
                        <div className="slds-modal__content slds-p-around_medium playground-activity-modal-content">
                            {activityModalType === "task" ? (
                                <div className="slds-form_compound">
                                    <TaskFormErrorSummary errors={taskErrors} />
                                    <QuickActionFormGroup>
                                        <QuickActionFormRow>
                                            <QuickActionSubjectCombobox error={taskErrors.Subject} idPrefix="activity-edit-task-subject-combobox" label="件名" required value={taskForm.Subject} onChange={(Subject) => onTaskFormChange({ ...taskForm, Subject })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <div className="slds-form-element slds-size_1-of-1">
                                                <QuickActionDatepicker label="期日" value={taskForm.ActivityDate} onChange={(ActivityDate) => onTaskFormChange({ ...taskForm, ActivityDate })} />
                                            </div>
                                        </QuickActionFormRow>
                                        <ActivityEditLookupRows assignedError={taskErrors.assignedUserName} activityLookupOptions={activityLookupOptions} activityLookups={activityLookups} onActivityLookupsChange={onActivityLookupsChange} />
                                        <QuickActionFormRow>
                                            <QuickActionSelect error={taskErrors.Status} label="状況" options={picklists?.taskStatusOptions} required value={taskForm.Status} onChange={(Status) => onTaskFormChange({ ...taskForm, Status })} />
                                        </QuickActionFormRow>
                                        <ActivityEditDescriptionRow value={taskForm.Description} onChange={(Description) => onTaskFormChange({ ...taskForm, Description })} />
                                    </QuickActionFormGroup>
                                </div>
                            ) : (
                                <div className="slds-form_compound">
                                    <EventFormErrorSummary errors={eventErrors} />
                                    <QuickActionFormGroup>
                                        <QuickActionFormRow>
                                            <QuickActionSubjectCombobox error={eventErrors.Subject} idPrefix="activity-edit-event-subject-combobox" label="件名" required value={eventForm.Subject} onChange={(Subject) => onEventFormChange({ ...eventForm, Subject })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionDateTimePicker error={eventErrors.StartDateTime} label="開始" required idPrefix="activity-edit-event-start" value={eventForm.StartDateTime} onChange={(StartDateTime) => onEventFormChange({ ...eventForm, StartDateTime })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionDateTimePicker error={eventErrors.EndDateTime} label="終了" required idPrefix="activity-edit-event-end" value={eventForm.EndDateTime} onChange={(EndDateTime) => onEventFormChange({ ...eventForm, EndDateTime })} />
                                        </QuickActionFormRow>
                                        <ActivityEditLookupRows assignedError={eventErrors.assignedUserName} activityLookupOptions={activityLookupOptions} activityLookups={activityLookups} onActivityLookupsChange={onActivityLookupsChange} />
                                        <QuickActionFormRow>
                                            <QuickActionTextInput label="場所" value={eventForm.Location} onChange={(Location) => onEventFormChange({ ...eventForm, Location })} />
                                        </QuickActionFormRow>
                                        <ActivityEditDescriptionRow value={eventForm.Description} onChange={(Description) => onEventFormChange({ ...eventForm, Description })} />
                                    </QuickActionFormGroup>
                                </div>
                            )}
                        </div>
                        <ModalFooter className="playground-activity-modal-footer" saving={saving} onCancel={actions.onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {deleteState ? (
                <Modal title="削除の確認" onClose={actions.onCancelDelete} narrow>
                    <div className="slds-modal__content slds-p-around_medium">
                        <p>
                            <strong>{deleteState.label}</strong> を削除しますか？ Salesforce からレコードを直接削除します。
                        </p>
                    </div>
                    <div className="slds-modal__footer">
                        <button className="slds-button slds-button_neutral" type="button" onClick={actions.onCancelDelete}>
                            キャンセル
                        </button>
                        <button className="slds-button slds-button_destructive" type="button" onClick={actions.onConfirmDelete} disabled={saving}>
                            {saving ? "削除中..." : "削除"}
                        </button>
                    </div>
                </Modal>
            ) : null}

            {restoreState ? (
                <Modal title="復元の確認" onClose={actions.onCancelRestore} narrow>
                    <div className="slds-modal__content slds-p-around_medium">
                        <p>
                            <strong>{restoreState.label}</strong> をごみ箱から復元しますか？
                        </p>
                    </div>
                    <div className="slds-modal__footer">
                        <button className="slds-button slds-button_neutral" type="button" onClick={actions.onCancelRestore}>
                            キャンセル
                        </button>
                        <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={actions.onConfirmRestore} disabled={saving}>
                            {saving ? "復元中..." : "復元"}
                        </button>
                    </div>
                </Modal>
            ) : null}
        </>
    );
}
