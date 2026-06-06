import { useCallback, useEffect, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { SessionInfo } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest, PlaygroundApiError } from "./api";
import { getSearchResultStatePatch } from "./playground-data-state";
import type { Account, ActiveTab, Contact, Notice, RecycleBinItem } from "./types";
import { usePlaygroundSelection } from "./usePlaygroundSelection";

type UsePlaygroundDataOptions = {
    showNotice: (notice: Notice) => void;
};

type ConnectedPlaygroundData = {
    accounts: Account[];
    contacts: Contact[];
    recycleBinItems: RecycleBinItem[];
};

async function loadSession() {
    return apiRequest<SessionInfo>(
        buildPlaygroundApiRequest(playgroundApiPaths.session)
    );
}

async function loadConnectedPlaygroundData(): Promise<ConnectedPlaygroundData> {
    const [accountResult, contactResult, recycleBinResult] = await Promise.all([
        apiRequest<{ accounts: Account[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.accounts)
        ),
        apiRequest<{ contacts: Contact[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.contacts)
        ),
        apiRequest<{ items: RecycleBinItem[] }>(
            buildPlaygroundApiRequest(playgroundApiPaths.recycleBin)
        )
    ]);

    return {
        accounts: accountResult.accounts,
        contacts: contactResult.contacts,
        recycleBinItems: recycleBinResult.items
    };
}

export function usePlaygroundData({ showNotice }: UsePlaygroundDataOptions) {
    const [session, setSession] = useState<SessionInfo | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItem[]>([]);
    const [loading, setLoading] = useState(true);
    const {
        accountOptions,
        activeTab,
        changeTab: selectTab,
        keepSelectionForData,
        openAccount,
        openContact,
        resetConnectedSelection,
        selectedAccount,
        selectedContact,
        setSelectedAccountId,
        setSelectedContactId
    } = usePlaygroundSelection({ accounts, contacts });
    const resetConnectedState = useCallback(() => {
        setSession({ connected: false });
        setAccounts([]);
        setContacts([]);
        setRecycleBinItems([]);
        resetConnectedSelection();
    }, [resetConnectedSelection]);

    const applyConnectedData = useCallback((data: ConnectedPlaygroundData) => {
        setAccounts(data.accounts);
        setContacts(data.contacts);
        setRecycleBinItems(data.recycleBinItems);
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

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    return {
        accountOptions,
        accounts,
        activeTab,
        changeTab,
        contacts,
        loading,
        loadAll,
        openSearchResult,
        recycleBinItems,
        selectedAccount,
        selectedContact,
        session,
        setSelectedAccountId,
        setSelectedContactId
    };
}
