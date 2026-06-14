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
    const initialViewState = getInitialPlaygroundViewState();
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialViewState.activeTab);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialViewState.selectedAccountId);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(initialViewState.selectedContactId);
    const viewStateRef = useRef<PlaygroundViewState>(initialViewState);

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
        replaceViewHistory(defaultPlaygroundViewState);
    }, [applyViewState]);

    const navigateToView = useCallback((state: PlaygroundViewState) => {
        viewStateRef.current = state;
        pushViewHistory(state);
        applyViewState(state);
    }, [applyViewState]);

    useEffect(() => {
        const currentState = getCurrentPlaygroundViewState();

        applyViewState(currentState);
        replaceViewHistory(currentState);

        function handlePopState() {
            applyViewState(getCurrentPlaygroundViewState());
        }

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [applyViewState]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        navigateToView({
            activeTab: nextTab,
            selectedAccountId: null,
            selectedContactId: null
        });
    }, [navigateToView]);

    const keepSelectionForData = useCallback((nextAccounts: Account[], nextContacts: Contact[]) => {
        setSelectedAccountId((currentId) => keepSelectedRecordId(currentId, nextAccounts));
        setSelectedContactId((currentId) => keepSelectedRecordId(currentId, nextContacts));
    }, []);

    const openAccount = useCallback((accountId: string) => {
        navigateToView({
            activeTab: "accounts" as const,
            selectedAccountId: accountId,
            selectedContactId: null
        });
    }, [navigateToView]);

    const openContact = useCallback((contactId: string) => {
        navigateToView({
            activeTab: "contacts" as const,
            selectedAccountId: null,
            selectedContactId: contactId
        });
    }, [navigateToView]);

    const openActivity = useCallback((activity: Activity) => {
        const nextState = {
            activeTab: "activities" as const,
            selectedAccountId: null,
            selectedContactId: null
        };

        viewStateRef.current = nextState;
        pushViewHistory(nextState);
        setSelectedAccountId(null);
        setSelectedContactId(null);
        setSelectedActivity(activity);
        setActiveTab("activities");
    }, []);

    const closeActivity = useCallback(() => {
        const nextState = {
            activeTab: "accounts" as const,
            selectedAccountId: null,
            selectedContactId: null
        };

        applyViewState(nextState);
        navigateToView(nextState);
    }, [applyViewState, navigateToView]);

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
        selectedAccountId,
        selectedActivity,
        selectedContact,
        selectedContactId,
        setSelectedActivity,
        setSelectedAccountId,
        setSelectedContactId
    };
}

function getInitialPlaygroundViewState() {
    if (typeof window === "undefined") {
        return defaultPlaygroundViewState;
    }

    return getCurrentPlaygroundViewState();
}

function getCurrentPlaygroundViewState() {
    return getPlaygroundViewStateFromLocation(window.location.pathname, window.location.search);
}

function getCurrentSearch() {
    return typeof window === "undefined" ? "" : window.location.search;
}

function pushViewHistory(state: PlaygroundViewState) {
    if (typeof window === "undefined") {
        return;
    }

    window.history.pushState(
        { playgroundView: state },
        "",
        buildPlaygroundViewUrl(getCurrentSearch(), state)
    );
}

function replaceViewHistory(state: PlaygroundViewState) {
    if (typeof window === "undefined") {
        return;
    }

    window.history.replaceState(
        { playgroundView: state },
        "",
        buildPlaygroundViewUrl(getCurrentSearch(), state)
    );
}
