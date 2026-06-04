import { useCallback, useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { SessionInfo } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest, PlaygroundApiError } from "./api";
import type { Account, ActiveTab, Contact, Notice, RecycleBinItem } from "./types";

type UsePlaygroundDataOptions = {
    showNotice: (notice: Notice) => void;
};

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

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const nextSession = await apiRequest<SessionInfo>(
                buildPlaygroundApiRequest(playgroundApiPaths.session)
            );
            if (!nextSession.connected) {
                resetConnectedState();
                return;
            }
            setSession(nextSession);

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
            setAccounts(accountResult.accounts);
            setContacts(contactResult.contacts);
            setRecycleBinItems(recycleBinResult.items);
            setSelectedAccountId((currentId) =>
                currentId && accountResult.accounts.some((account) => account.Id === currentId) ? currentId : null
            );
            setSelectedContactId((currentId) =>
                currentId && contactResult.contacts.some((contact) => contact.Id === currentId) ? currentId : null
            );
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
    }, [resetConnectedState, showNotice]);

    const changeTab = useCallback((nextTab: ActiveTab) => {
        setActiveTab(nextTab);
        setSelectedAccountId(null);
        setSelectedContactId(null);
        void loadAll();
    }, [loadAll]);

    const openSearchResult = useCallback((result: SearchResultItem) => {
        if (result.type === "account") {
            setAccounts((currentAccounts) => [
                result.record,
                ...currentAccounts.filter((account) => account.Id !== result.record.Id)
            ]);
            setSelectedContactId(null);
            setSelectedAccountId(result.record.Id);
            setActiveTab("accounts");
            return;
        }

        setContacts((currentContacts) => [
            result.record,
            ...currentContacts.filter((contact) => contact.Id !== result.record.Id)
        ]);
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
