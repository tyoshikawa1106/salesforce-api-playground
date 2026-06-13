import { useCallback, useEffect, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import { createEmptyHomeRecordCounts } from "@/lib/playground-record-counts";
import type { HomeRecordCounts } from "@/lib/playground-record-counts";
import type { SessionInfo } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest, PlaygroundApiError } from "../utils/api";
import { getSearchResultStatePatch } from "../utils/playground-data-state";
import type { Account, ActiveTab, Activity, Contact, Notice, RecycleBinItem } from "../utils/types";
import { usePlaygroundSelection } from "./usePlaygroundSelection";

type UsePlaygroundDataOptions = {
    showNotice: (notice: Notice) => void;
};

type ConnectedPlaygroundData = {
    accounts: Account[];
    activityCounts: {
        events: number;
        tasks: number;
    };
    contacts: Contact[];
    recordCounts: HomeRecordCounts;
    recycleBinItems: RecycleBinItem[];
    userCounts: {
        active: number;
    };
    userName?: string;
};

async function loadSession() {
    return apiRequest<SessionInfo>(
        buildPlaygroundApiRequest(playgroundApiPaths.session)
    );
}

async function loadConnectedPlaygroundData(): Promise<ConnectedPlaygroundData> {
    const [accountResult, activityCountResult, contactResult, currentUserResult, recordCountResult, recycleBinResult, userCountResult] = await Promise.all([
        apiRequest<{ accounts: Account[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.accounts)
        ),
        apiRequest<{ activityCounts: ConnectedPlaygroundData["activityCounts"] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.activityCounts)
        ),
        apiRequest<{ contacts: Contact[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.contacts)
        ),
        apiRequest<{ userName?: string }>(
            buildPlaygroundApiRequest(playgroundApiPaths.currentUser)
        ).catch(() => ({ userName: undefined })),
        apiRequest<{ recordCounts: ConnectedPlaygroundData["recordCounts"] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.recordCounts)
        ),
        apiRequest<{ items: RecycleBinItem[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.recycleBin)
        ),
        apiRequest<{ userCounts: ConnectedPlaygroundData["userCounts"] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.userCounts)
        )
    ]);

    return {
        accounts: accountResult.accounts,
        activityCounts: activityCountResult.activityCounts,
        contacts: contactResult.contacts,
        recordCounts: recordCountResult.recordCounts,
        recycleBinItems: recycleBinResult.items,
        userCounts: userCountResult.userCounts,
        userName: currentUserResult.userName
    };
}

export function usePlaygroundData({ showNotice }: UsePlaygroundDataOptions) {
    const [session, setSession] = useState<SessionInfo | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [activityCounts, setActivityCounts] = useState<ConnectedPlaygroundData["activityCounts"]>({ events: 0, tasks: 0 });
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [recordCounts, setRecordCounts] = useState<ConnectedPlaygroundData["recordCounts"]>(createEmptyHomeRecordCounts);
    const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItem[]>([]);
    const [userCounts, setUserCounts] = useState<ConnectedPlaygroundData["userCounts"]>({ active: 0 });
    const [loading, setLoading] = useState(true);
    const {
        accountOptions,
        activeTab,
        changeTab: selectTab,
        closeActivity,
        keepSelectionForData,
        openAccount,
        openActivity,
        openContact,
        resetConnectedSelection,
        selectedAccount,
        selectedActivity,
        selectedContact,
        setSelectedAccountId,
        setSelectedActivity,
        setSelectedContactId
    } = usePlaygroundSelection({ accounts, contacts });
    const resetConnectedState = useCallback(() => {
        setSession({ connected: false });
        setAccounts([]);
        setActivityCounts({ events: 0, tasks: 0 });
        setContacts([]);
        setRecordCounts(createEmptyHomeRecordCounts());
        setRecycleBinItems([]);
        setUserCounts({ active: 0 });
        resetConnectedSelection();
    }, [resetConnectedSelection]);

    const applyConnectedData = useCallback((data: ConnectedPlaygroundData) => {
        setAccounts(data.accounts);
        setActivityCounts(data.activityCounts);
        setContacts(data.contacts);
        setRecordCounts(data.recordCounts);
        setRecycleBinItems(data.recycleBinItems);
        setUserCounts(data.userCounts);
        setSession((currentSession) => currentSession?.connected
            ? { ...currentSession, userName: data.userName }
            : currentSession);
        keepSelectionForData(data.accounts, data.contacts);
    }, [keepSelectionForData]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const nextSession = await loadSession();
            if (!nextSession.connected) {
                resetConnectedState();
                return;
            }
            setSession(nextSession);

            applyConnectedData(await loadConnectedPlaygroundData());
        } catch (error) {
            if (error instanceof PlaygroundApiError && error.status === 401) {
                resetConnectedState();
            }
            showNotice({
                tone: "error",
                message: error instanceof Error ? error.message : "Salesforce データを読み込めませんでした。"
            });
        } finally {
            setLoading(false);
        }
    }, [applyConnectedData, resetConnectedState, showNotice]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        selectTab(nextTab);
        void loadAll();
    }, [loadAll, selectTab]);

    const openSearchResult = useCallback((result: SearchResultItem) => {
        const patch = getSearchResultStatePatch(result, accounts, contacts);

        if (patch.type === "account") {
            setAccounts(patch.accounts);
            openAccount(patch.selectedAccountId);
            return;
        }

        setContacts(patch.contacts);
        openContact(patch.selectedContactId);
    }, [accounts, contacts, openAccount, openContact]);

    const refreshActivity = useCallback(async (activity: Activity) => {
        const path = activity.type === "task"
            ? playgroundApiPaths.activityTask(activity.id)
            : playgroundApiPaths.activityEvent(activity.id);
        const data = await apiRequest<{ activity: Activity | null }>(
            buildPlaygroundApiRequest(path)
        );

        setSelectedActivity(data.activity);
    }, [setSelectedActivity]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    return {
        accountOptions,
        accounts,
        activeTab,
        activityCounts,
        changeTab,
        closeActivity,
        contacts,
        loading,
        loadAll,
        openAccount,
        openActivity,
        openContact,
        openSearchResult,
        recordCounts,
        recycleBinItems,
        selectedAccount,
        selectedActivity,
        selectedContact,
        refreshActivity,
        session,
        userCounts,
        setSelectedAccountId,
        setSelectedContactId
    };
}
