import { useCallback, useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { SessionInfo } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest, PlaygroundApiError } from "./api";
import { keepSelectedRecordId, upsertRecordById } from "./playground-data-state";
import type { Account, ActiveTab, Contact, Notice, RecycleBinItem } from "./types";

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
    const [activeTab, setActiveTab] = useState<ActiveTab>("home");
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
    const resetConnectedState = useCallback(() => {
        setSession({ connected: false });
        setAccounts([]);
        setContacts([]);
        setRecycleBinItems([]);
        setActiveTab("home");
        setSelectedAccountId(null);
        setSelectedContactId(null);
    }, []);

    const applyConnectedData = useCallback((data: ConnectedPlaygroundData) => {
        setAccounts(data.accounts);
        setContacts(data.contacts);
        setRecycleBinItems(data.recycleBinItems);
        setSelectedAccountId((currentId) => keepSelectedRecordId(currentId, data.accounts));
        setSelectedContactId((currentId) => keepSelectedRecordId(currentId, data.contacts));
    }, []);

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
        setActiveTab(nextTab);
        setSelectedAccountId(null);
        setSelectedContactId(null);
        void loadAll();
    }, [loadAll]);

    const openSearchResult = useCallback((result: SearchResultItem) => {
        if (result.type === "account") {
            setAccounts((currentAccounts) => upsertRecordById(currentAccounts, result.record));
            setSelectedContactId(null);
            setSelectedAccountId(result.record.Id);
            setActiveTab("accounts");
            return;
        }

        setContacts((currentContacts) => upsertRecordById(currentContacts, result.record));
        setSelectedAccountId(null);
        setSelectedContactId(result.record.Id);
        setActiveTab("contacts");
    }, []);

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
