import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const initialViewState = useMemo(
        () => getPlaygroundViewStateFromLocation(pathname, currentSearch),
        [currentSearch, pathname]
    );
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
        router.replace(buildPlaygroundViewUrl(currentSearch, defaultPlaygroundViewState), { scroll: false });
    }, [applyViewState, currentSearch, router]);

    const navigateToView = useCallback((state: PlaygroundViewState, mode: "push" | "replace" = "push") => {
        viewStateRef.current = state;
        router[mode](buildPlaygroundViewUrl(currentSearch, state), { scroll: false });
    }, [currentSearch, router]);

    useEffect(() => {
        const currentState = getPlaygroundViewStateFromLocation(pathname, currentSearch);
        const canonicalUrl = buildPlaygroundViewUrl(currentSearch, currentState);
        const currentUrl = `${pathname}${currentSearch}`;

        applyViewState(currentState);

        if (canonicalUrl !== currentUrl) {
            router.replace(canonicalUrl, { scroll: false });
        }
    }, [applyViewState, currentSearch, pathname, router]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        const nextState = {
            activeTab: nextTab,
            selectedAccountId: null,
            selectedContactId: null
        };

        applyViewState(nextState);
        navigateToView(nextState);
    }, [applyViewState, navigateToView]);

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
        navigateToView(nextState);
    }, [applyViewState, navigateToView]);

    const openContact = useCallback((contactId: string) => {
        const nextState = {
            activeTab: "contacts" as const,
            selectedAccountId: null,
            selectedContactId: contactId
        };

        applyViewState(nextState);
        navigateToView(nextState);
    }, [applyViewState, navigateToView]);

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
        navigateToView(nextState);
    }, [navigateToView]);

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
        selectedActivity,
        selectedContact,
        setSelectedActivity,
        setSelectedAccountId,
        setSelectedContactId
    };
}
