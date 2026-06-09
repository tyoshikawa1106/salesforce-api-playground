import type { FormEvent } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import type { ActivityLookupState, EventForm, TaskForm } from "./activity-task-form";
import {
    EventFormErrorSummary,
    QuickActionDatepicker,
    QuickActionDateTimePicker,
    QuickActionLongTextInput,
    QuickActionLookup,
    QuickActionSelect,
    QuickActionSubjectCombobox,
    QuickActionTextInput,
    TaskFormErrorSummary
} from "./ActivityCard";
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
    const activityLookupOptions = {
        assigned: activityLookups.assigned ? [activityLookups.assigned] : [],
        name: activityLookups.name ? [activityLookups.name] : [],
        related: activityLookups.related ? [activityLookups.related] : []
    };
    const taskErrors = validateTaskForm(taskForm, activityLookups.assigned?.label);
    const eventErrors = validateEventForm(eventForm, activityLookups.assigned?.label);

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

            {modal?.type === "activity" ? (
                <Modal title={`${modal.record.type === "task" ? "ToDo" : "行動"}を編集`} onClose={actions.onCloseRecordModal}>
                    <form onSubmit={actions.onSaveActivity} noValidate>
                        <div className="slds-modal__content slds-p-around_medium">
                            {modal.record.type === "task" ? (
                                <div className="slds-form_compound">
                                    <TaskFormErrorSummary errors={taskErrors} />
                                    <div className="slds-form-element__group">
                                        <div className="slds-form-element__row">
                                            <QuickActionSubjectCombobox error={taskErrors.Subject} label="件名" required value={taskForm.Subject} onChange={(Subject) => onTaskFormChange({ ...taskForm, Subject })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <div className="slds-form-element slds-size_1-of-1">
                                                <QuickActionDatepicker label="期日" value={taskForm.ActivityDate} onChange={(ActivityDate) => onTaskFormChange({ ...taskForm, ActivityDate })} />
                                            </div>
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup label="名前" objectLabel="取引先責任者" options={activityLookupOptions.name} placeholder="取引先責任者を検索..." value={activityLookups.name} onChange={(name) => onActivityLookupsChange({ ...activityLookups, name })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup label="関連先" objectLabel="取引先" options={activityLookupOptions.related} placeholder="取引先を検索..." value={activityLookups.related} onChange={(related) => onActivityLookupsChange({ ...activityLookups, related })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup error={taskErrors.assignedUserName} label="割り当て先" objectLabel="ユーザー" options={activityLookupOptions.assigned} placeholder="ユーザーを検索..." required value={activityLookups.assigned} onChange={(assigned) => onActivityLookupsChange({ ...activityLookups, assigned })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionSelect error={taskErrors.Status} label="状況" required value={taskForm.Status} onChange={(Status) => onTaskFormChange({ ...taskForm, Status })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLongTextInput label="説明" value={taskForm.Description} onChange={(Description) => onTaskFormChange({ ...taskForm, Description })} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="slds-form_compound">
                                    <EventFormErrorSummary errors={eventErrors} />
                                    <div className="slds-form-element__group">
                                        <div className="slds-form-element__row">
                                            <QuickActionSubjectCombobox error={eventErrors.Subject} label="件名" required value={eventForm.Subject} onChange={(Subject) => onEventFormChange({ ...eventForm, Subject })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionDateTimePicker error={eventErrors.StartDateTime} label="開始" required idPrefix="activity-edit-event-start" value={eventForm.StartDateTime} onChange={(StartDateTime) => onEventFormChange({ ...eventForm, StartDateTime })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionDateTimePicker error={eventErrors.EndDateTime} label="終了" required idPrefix="activity-edit-event-end" value={eventForm.EndDateTime} onChange={(EndDateTime) => onEventFormChange({ ...eventForm, EndDateTime })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup label="名前" objectLabel="取引先責任者" options={activityLookupOptions.name} placeholder="取引先責任者を検索..." value={activityLookups.name} onChange={(name) => onActivityLookupsChange({ ...activityLookups, name })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup label="関連先" objectLabel="取引先" options={activityLookupOptions.related} placeholder="取引先を検索..." value={activityLookups.related} onChange={(related) => onActivityLookupsChange({ ...activityLookups, related })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLookup error={eventErrors.assignedUserName} label="割り当て先" objectLabel="ユーザー" options={activityLookupOptions.assigned} placeholder="ユーザーを検索..." required value={activityLookups.assigned} onChange={(assigned) => onActivityLookupsChange({ ...activityLookups, assigned })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionTextInput label="場所" value={eventForm.Location} onChange={(Location) => onEventFormChange({ ...eventForm, Location })} />
                                        </div>
                                        <div className="slds-form-element__row">
                                            <QuickActionLongTextInput label="説明" value={eventForm.Description} onChange={(Description) => onEventFormChange({ ...eventForm, Description })} />
                                        </div>
                                    </div>
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
