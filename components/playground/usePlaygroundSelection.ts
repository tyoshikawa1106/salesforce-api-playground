import { useCallback, useMemo, useState } from "react";
import { keepSelectedRecordId } from "./playground-data-state";
import type { Account, ActiveTab, Activity, Contact } from "./types";

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
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
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
        setSelectedActivity(null);
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
        setSelectedActivity(null);
        setSelectedContactId(null);
        setSelectedAccountId(accountId);
        setActiveTab("accounts");
    }, []);

    const openContact = useCallback((contactId: string) => {
        setSelectedActivity(null);
        setSelectedAccountId(null);
        setSelectedContactId(contactId);
        setActiveTab("contacts");
    }, []);

    const openActivity = useCallback((activity: Activity) => {
        setSelectedAccountId(null);
        setSelectedContactId(null);
        setSelectedActivity(activity);
        setActiveTab("activities");
    }, []);

    const closeActivity = useCallback(() => {
        setSelectedActivity(null);
        setActiveTab("accounts");
    }, []);

    return {
        accountOptions,
        activeTab,
        changeTab,
        closeActivity,
        keepSelectionForData,
        openAccount,
        openActivity,
        openContact,
        resetConnectedSelection,
        selectedAccount,
        selectedActivity,
        selectedContact,
        setSelectedActivity,
        setSelectedAccountId,
        setSelectedContactId
    };
}
