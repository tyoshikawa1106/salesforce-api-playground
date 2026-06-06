import { type FormEvent, useState } from "react";
import type { AccountForm, ContactForm } from "@/lib/salesforce/records";
import {
    accountTextFields,
    accountRecordToForm,
    blankAccount,
    blankContact,
    contactRecordToForm,
    contactTextFields,
    getRequiredFieldMessage
} from "./record-forms";
import {
    createIntegrationAccountMutation,
    deleteRecordMutation,
    restoreRecycleBinItemsMutation,
    saveAccountMutation,
    saveContactMutation
} from "./mutations";
import { runMutationWithNotice } from "./mutation-runner";
import type { Account, Contact, DeleteState, ModalState, Notice, RecycleBinItem, RestoreState } from "./types";

type UseRecordMutationsOptions = {
    loadAll: () => Promise<void>;
    showNotice: (notice: Notice) => void;
};

const accountNameRequiredMessage = getRequiredFieldMessage(accountTextFields, "Name");
const contactLastNameRequiredMessage = getRequiredFieldMessage(contactTextFields, "LastName");

export function useRecordMutations({ loadAll, showNotice }: UseRecordMutationsOptions) {
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const [restoreState, setRestoreState] = useState<RestoreState | null>(null);
    const [accountForm, setAccountForm] = useState<AccountForm>(blankAccount);
    const [integrationAccountForm, setIntegrationAccountForm] = useState<AccountForm>(blankAccount);
    const [contactForm, setContactForm] = useState<ContactForm>(blankContact);

    function openAccountModal(record?: Account) {
        setAccountForm(accountRecordToForm(record));
        setModal(record ? { type: "account", mode: "edit", record } : { type: "account", mode: "create" });
    }

    function openContactModal(record?: Contact) {
        setContactForm(contactRecordToForm(record));
        setModal(record ? { type: "contact", mode: "edit", record } : { type: "contact", mode: "create" });
    }

    async function saveAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!accountForm.Name.trim()) {
            showNotice({ tone: "error", message: accountNameRequiredMessage });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => saveAccountMutation(modal, accountForm),
            fallbackErrorMessage: "取引先の保存に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setModal(null);
                await loadAll();
            }
        });
    }

    async function saveContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!contactForm.LastName.trim()) {
            showNotice({ tone: "error", message: contactLastNameRequiredMessage });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => saveContactMutation(modal, contactForm),
            fallbackErrorMessage: "取引先責任者の保存に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setModal(null);
                await loadAll();
            }
        });
    }

    async function createIntegrationAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!integrationAccountForm.Name.trim()) {
            showNotice({ tone: "error", message: accountNameRequiredMessage });
            return;
        }

        await runMutationWithNotice({
            runMutation: () => createIntegrationAccountMutation(integrationAccountForm),
            fallbackErrorMessage: "連携ユーザーでの取引先作成に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setIntegrationAccountForm(blankAccount);
                await loadAll();
            }
        });
    }

    async function confirmDelete() {
        if (!deleteState) {
            return;
        }

        await runMutationWithNotice({
            runMutation: () => deleteRecordMutation(deleteState),
            fallbackErrorMessage: "削除に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setDeleteState(null);
                await loadAll();
            },
            onError: loadAll
        });
    }

    function openRestoreModal(items: RecycleBinItem[]) {
        const label = items.length === 1
            ? `${items[0].objectLabel} ${items[0].name}`
            : `選択した項目 ${items.length} 件`;

        setRestoreState({ items, label });
    }

    async function confirmRestore() {
        if (!restoreState) {
            return;
        }

        await runMutationWithNotice({
            runMutation: () => restoreRecycleBinItemsMutation(restoreState.items),
            fallbackErrorMessage: "復元に失敗しました。",
            setSaving,
            showNotice,
            onSuccess: async () => {
                setRestoreState(null);
                await loadAll();
            },
            onError: loadAll
        });
    }

    return {
        accountForm,
        closeDeleteModal: () => setDeleteState(null),
        closeRestoreModal: () => setRestoreState(null),
        closeRecordModal: () => setModal(null),
        confirmDelete,
        confirmRestore,
        contactForm,
        createIntegrationAccount,
        deleteState,
        integrationAccountForm,
        modal,
        openAccountModal,
        openContactModal,
        saveAccount,
        saveContact,
        saving,
        restoreState,
        setAccountForm,
        setContactForm,
        setDeleteState,
        setIntegrationAccountForm,
        openRestoreModal
    };
}
