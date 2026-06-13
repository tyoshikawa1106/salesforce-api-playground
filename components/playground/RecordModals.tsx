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
    QuickActionLookup,
    QuickActionSelect,
    QuickActionSubjectCombobox,
    QuickActionTextInput,
    TaskFormErrorSummary
} from "./ActivityQuickActionFields";
import {
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

export function RecordModals({
    forms,
    state,
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
                    <form onSubmit={actions.onSaveAccount}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <AccountFormFields value={accountForm} onChange={onAccountFormChange} />
                        </div>
                        <ModalFooter saving={saving} onCancel={actions.onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "contact" ? (
                <Modal title={modal.mode === "create" ? "新規取引先責任者" : "取引先責任者を編集"} onClose={actions.onCloseRecordModal}>
                    <form onSubmit={actions.onSaveContact}>
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
                        <div className="slds-modal__content slds-p-around_medium">
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
                                        <QuickActionFormRow>
                                            <QuickActionLookup label="名前" objectLabel="取引先責任者" options={activityLookupOptions.name} placeholder="取引先責任者を検索..." value={activityLookups.name} onChange={(name) => onActivityLookupsChange({ ...activityLookups, name })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLookup label="関連先" objectLabel="取引先" options={activityLookupOptions.related} placeholder="取引先を検索..." value={activityLookups.related} onChange={(related) => onActivityLookupsChange({ ...activityLookups, related })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLookup error={taskErrors.assignedUserName} label="割り当て先" objectLabel="ユーザー" options={activityLookupOptions.assigned} placeholder="ユーザーを検索..." required value={activityLookups.assigned} onChange={(assigned) => onActivityLookupsChange({ ...activityLookups, assigned })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionSelect error={taskErrors.Status} label="状況" required value={taskForm.Status} onChange={(Status) => onTaskFormChange({ ...taskForm, Status })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLongTextInput label="説明" value={taskForm.Description} onChange={(Description) => onTaskFormChange({ ...taskForm, Description })} />
                                        </QuickActionFormRow>
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
                                        <QuickActionFormRow>
                                            <QuickActionLookup label="名前" objectLabel="取引先責任者" options={activityLookupOptions.name} placeholder="取引先責任者を検索..." value={activityLookups.name} onChange={(name) => onActivityLookupsChange({ ...activityLookups, name })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLookup label="関連先" objectLabel="取引先" options={activityLookupOptions.related} placeholder="取引先を検索..." value={activityLookups.related} onChange={(related) => onActivityLookupsChange({ ...activityLookups, related })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLookup error={eventErrors.assignedUserName} label="割り当て先" objectLabel="ユーザー" options={activityLookupOptions.assigned} placeholder="ユーザーを検索..." required value={activityLookups.assigned} onChange={(assigned) => onActivityLookupsChange({ ...activityLookups, assigned })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionTextInput label="場所" value={eventForm.Location} onChange={(Location) => onEventFormChange({ ...eventForm, Location })} />
                                        </QuickActionFormRow>
                                        <QuickActionFormRow>
                                            <QuickActionLongTextInput label="説明" value={eventForm.Description} onChange={(Description) => onEventFormChange({ ...eventForm, Description })} />
                                        </QuickActionFormRow>
                                    </QuickActionFormGroup>
                                </div>
                            )}
                        </div>
                        <ModalFooter saving={saving} onCancel={actions.onCloseRecordModal} />
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
