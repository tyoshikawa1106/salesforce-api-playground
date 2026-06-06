import { useCallback, useMemo, useState } from "react";
import { keepSelectedRecordId } from "./playground-data-state";
import type { Account, ActiveTab, Contact } from "./types";

type UsePlaygroundSelectionOptions = {
    accounts: Account[];
    contacts: Contact[];
};

export function usePlaygroundSelection({
    accounts,
    contacts
}: UsePlaygroundSelectionOptions) {
    const [activeTab, setActiveTab] = useState<ActiveTab>("home");
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

    const accountOptions = useMemo(
        () => [...accounts].sort((a, b) => a.Name.localeCompare(b.Name, "ja")),
        [accounts]
    );
    const selectedAccount = useMemo(
        () => accounts.find((account) => account.Id === selectedAccountId) ?? null,
        [accounts, selectedAccountId]
    );
    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.Id === selectedContactId) ?? null,
        [contacts, selectedContactId]
    );

    const clearSelectedRecords = useCallback(() => {
        setSelectedAccountId(null);
        setSelectedContactId(null);
    }, []);

    const resetConnectedSelection = useCallback(() => {
        setActiveTab("home");
        clearSelectedRecords();
    }, [clearSelectedRecords]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        setActiveTab(nextTab);
        clearSelectedRecords();
    }, [clearSelectedRecords]);

    const keepSelectionForData = useCallback((nextAccounts: Account[], nextContacts: Contact[]) => {
        setSelectedAccountId((currentId) => keepSelectedRecordId(currentId, nextAccounts));
        setSelectedContactId((currentId) => keepSelectedRecordId(currentId, nextContacts));
    }, []);

    const openAccount = useCallback((accountId: string) => {
        setSelectedContactId(null);
        setSelectedAccountId(accountId);
        setActiveTab("accounts");
    }, []);

    const openContact = useCallback((contactId: string) => {
        setSelectedAccountId(null);
        setSelectedContactId(contactId);
        setActiveTab("contacts");
    }, []);

    return {
        accountOptions,
        activeTab,
        changeTab,
        keepSelectionForData,
        openAccount,
        openContact,
        resetConnectedSelection,
        selectedAccount,
        selectedContact,
        setSelectedAccountId,
        setSelectedContactId
    };
}
