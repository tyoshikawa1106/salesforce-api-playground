import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    buildPlaygroundViewUrl,
    defaultPlaygroundViewState,
    getPlaygroundViewStateFromLocation,
    keepSelectedRecordId
} from "../utils/playground-data-state";
import type { PlaygroundViewState } from "../utils/playground-data-state";
import type { Account, ActiveTab, Activity, Contact } from "../utils/types";

type UsePlaygroundSelectionOptions = {
    accounts: Account[];
    contacts: Contact[];
};

export function usePlaygroundSelection({
    accounts,
    contacts
}: UsePlaygroundSelectionOptions) {
    const [activeTab, setActiveTab] = useState<ActiveTab>(defaultPlaygroundViewState.activeTab);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(defaultPlaygroundViewState.selectedAccountId);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(defaultPlaygroundViewState.selectedContactId);
    const viewStateRef = useRef<PlaygroundViewState>(defaultPlaygroundViewState);

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

    const applyViewState = useCallback((state: PlaygroundViewState) => {
        viewStateRef.current = state;
        setActiveTab(state.activeTab);
        setSelectedAccountId(state.selectedAccountId);
        setSelectedActivity(null);
        setSelectedContactId(state.selectedContactId);
    }, []);

    const resetConnectedSelection = useCallback(() => {
        applyViewState(defaultPlaygroundViewState);
        if (typeof window !== "undefined") {
            window.history.replaceState(
                { playgroundView: defaultPlaygroundViewState },
                "",
                buildPlaygroundViewUrl(window.location.search, defaultPlaygroundViewState)
            );
        }
    }, [applyViewState]);

    const writeViewHistory = useCallback((state: PlaygroundViewState, mode: "pushState" | "replaceState" = "pushState") => {
        viewStateRef.current = state;

        if (typeof window === "undefined") {
            return;
        }

        window.history[mode](
            { playgroundView: state },
            "",
            buildPlaygroundViewUrl(window.location.search, state)
        );
    }, []);

    useEffect(() => {
        const currentState = getPlaygroundViewStateFromLocation(window.location.pathname, window.location.search);
        applyViewState(currentState);
        writeViewHistory(currentState, "replaceState");

        function handlePopState() {
            applyViewState(getPlaygroundViewStateFromLocation(window.location.pathname, window.location.search));
        }

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [applyViewState, writeViewHistory]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        const nextState = {
            activeTab: nextTab,
            selectedAccountId: null,
            selectedContactId: null
        };

        applyViewState(nextState);
        writeViewHistory(nextState);
    }, [applyViewState, writeViewHistory]);

    const keepSelectionForData = useCallback((nextAccounts: Account[], nextContacts: Contact[]) => {
        setSelectedAccountId((currentId) => keepSelectedRecordId(currentId, nextAccounts));
        setSelectedContactId((currentId) => keepSelectedRecordId(currentId, nextContacts));
    }, []);

    const openAccount = useCallback((accountId: string) => {
        const nextState = {
            activeTab: "accounts" as const,
            selectedAccountId: accountId,
            selectedContactId: null
        };

        applyViewState(nextState);
        writeViewHistory(nextState);
    }, [applyViewState, writeViewHistory]);

    const openContact = useCallback((contactId: string) => {
        const nextState = {
            activeTab: "contacts" as const,
            selectedAccountId: null,
            selectedContactId: contactId
        };

        applyViewState(nextState);
        writeViewHistory(nextState);
    }, [applyViewState, writeViewHistory]);

    const openActivity = useCallback((activity: Activity) => {
        const nextState = {
            activeTab: "activities" as const,
            selectedAccountId: null,
            selectedContactId: null
        };

        viewStateRef.current = nextState;
        setSelectedAccountId(null);
        setSelectedContactId(null);
        setSelectedActivity(activity);
        setActiveTab("activities");
        writeViewHistory(nextState);
    }, [writeViewHistory]);

    const closeActivity = useCallback(() => {
        const nextState = {
            activeTab: "accounts" as const,
            selectedAccountId: null,
            selectedContactId: null
        };

        applyViewState(nextState);
        writeViewHistory(nextState);
    }, [applyViewState, writeViewHistory]);

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
