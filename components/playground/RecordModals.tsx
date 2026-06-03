import type { FormEvent } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import {
    AccountFormFields,
    ContactFormFields
} from "./Forms";
import { Modal, ModalFooter } from "./Modal";
import type { Account, DeleteState, ModalState } from "./types";

type RecordModalsProps = {
    accountForm: AccountForm;
    accountOptions: Account[];
    contactForm: ContactForm;
    deleteState: DeleteState | null;
    modal: ModalState | null;
    saving: boolean;
    onAccountFormChange: (value: AccountForm) => void;
    onCancelDelete: () => void;
    onCloseRecordModal: () => void;
    onConfirmDelete: () => void;
    onContactFormChange: (value: ContactForm) => void;
    onSaveAccount: (event: FormEvent<HTMLFormElement>) => void;
    onSaveContact: (event: FormEvent<HTMLFormElement>) => void;
};

export function RecordModals({
    accountForm,
    accountOptions,
    contactForm,
    deleteState,
    modal,
    saving,
    onAccountFormChange,
    onCancelDelete,
    onCloseRecordModal,
    onConfirmDelete,
    onContactFormChange,
    onSaveAccount,
    onSaveContact
}: RecordModalsProps) {
    return (
        <>
            {modal?.type === "account" ? (
                <Modal title={modal.mode === "create" ? "新規取引先" : "取引先を編集"} onClose={onCloseRecordModal}>
                    <form onSubmit={onSaveAccount}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <AccountFormFields value={accountForm} onChange={onAccountFormChange} />
                        </div>
                        <ModalFooter saving={saving} onCancel={onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {modal?.type === "contact" ? (
                <Modal title={modal.mode === "create" ? "新規取引先責任者" : "取引先責任者を編集"} onClose={onCloseRecordModal}>
                    <form onSubmit={onSaveContact}>
                        <div className="slds-modal__content slds-p-around_medium">
                            <ContactFormFields value={contactForm} accounts={accountOptions} onChange={onContactFormChange} />
                        </div>
                        <ModalFooter saving={saving} onCancel={onCloseRecordModal} />
                    </form>
                </Modal>
            ) : null}

            {deleteState ? (
                <Modal title="削除の確認" onClose={onCancelDelete} narrow>
                    <div className="slds-modal__content slds-p-around_medium">
                        <p>
                            <strong>{deleteState.label}</strong> を削除しますか？ Salesforce からレコードを直接削除します。
                        </p>
                    </div>
                    <div className="slds-modal__footer">
                        <button className="slds-button slds-button_neutral" type="button" onClick={onCancelDelete}>
                            キャンセル
                        </button>
                        <button className="slds-button slds-button_destructive" type="button" onClick={onConfirmDelete} disabled={saving}>
                            {saving ? "削除中..." : "削除"}
                        </button>
                    </div>
                </Modal>
            ) : null}
        </>
    );
}
