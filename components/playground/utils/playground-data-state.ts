import type { SearchResultItem } from "@/lib/salesforce/records";
import type { Account, ActiveTab, Contact } from "./types";

export type SearchResultStatePatch =
    | {
        type: "account";
        accounts: Account[];
        activeTab: Extract<ActiveTab, "accounts">;
        selectedAccountId: string;
        selectedContactId: null;
    }
    | {
        type: "contact";
        contacts: Contact[];
        activeTab: Extract<ActiveTab, "contacts">;
        selectedAccountId: null;
        selectedContactId: string;
    };

export type PlaygroundViewState = {
    activeTab: ActiveTab;
    selectedAccountId: string | null;
    selectedContactId: string | null;
};

export const defaultPlaygroundViewState: PlaygroundViewState = {
    activeTab: "home",
    selectedAccountId: null,
    selectedContactId: null
};

export function keepSelectedRecordId<Record extends { Id: string }>(
    currentId: string | null,
    records: Record[]
) {
    return currentId && records.some((record) => record.Id === currentId) ? currentId : null;
}

export function getPlaygroundViewStateFromLocation(pathname: string, search: string): PlaygroundViewState {
    const searchParams = new URLSearchParams(search);
    const segments = pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));

    if (segments[0] === "accounts") {
        return {
            activeTab: "accounts",
            selectedAccountId: segments[1]?.trim() || null,
            selectedContactId: null
        };
    }

    if (segments[0] === "contacts") {
        return {
            activeTab: "contacts",
            selectedAccountId: null,
            selectedContactId: segments[1]?.trim() || null
        };
    }

    if (segments[0] === "integration") {
        return {
            activeTab: "integration",
            selectedAccountId: null,
            selectedContactId: null
        };
    }

    if (segments[0] === "recycle-bin") {
        return {
            activeTab: "recycleBin",
            selectedAccountId: null,
            selectedContactId: null
        };
    }

    if (segments[0] === "activities") {
        return {
            activeTab: "activities",
            selectedAccountId: null,
            selectedContactId: null
        };
    }

    const fallbackView = searchParams.get("view");
    if (fallbackView === "accounts" || fallbackView === "contacts" || fallbackView === "integration" || fallbackView === "recycleBin") {
        return {
            activeTab: fallbackView,
            selectedAccountId: fallbackView === "accounts" ? searchParams.get("accountId")?.trim() || null : null,
            selectedContactId: fallbackView === "contacts" ? searchParams.get("contactId")?.trim() || null : null
        };
    }

    return {
        activeTab: "home",
        selectedAccountId: null,
        selectedContactId: null
    };
}

export function getPlaygroundViewPath(state: PlaygroundViewState) {
    if (state.activeTab === "accounts") {
        return state.selectedAccountId ? `/accounts/${encodeURIComponent(state.selectedAccountId)}` : "/accounts";
    }

    if (state.activeTab === "contacts") {
        return state.selectedContactId ? `/contacts/${encodeURIComponent(state.selectedContactId)}` : "/contacts";
    }

    if (state.activeTab === "integration") {
        return "/integration";
    }

    if (state.activeTab === "recycleBin") {
        return "/recycle-bin";
    }

    if (state.activeTab === "activities") {
        return "/activities";
    }

    return "/";
}

export function buildPlaygroundViewUrl(currentSearch: string, state: PlaygroundViewState) {
    const searchParams = new URLSearchParams(currentSearch);
    searchParams.delete("auth");
    searchParams.delete("view");
    searchParams.delete("accountId");
    searchParams.delete("contactId");

    const query = searchParams.toString();
    const pathname = getPlaygroundViewPath(state);
    return query ? `${pathname}?${query}` : pathname;
}

export function upsertRecordById<Record extends { Id: string }>(records: Record[], nextRecord: Record) {
    return [
        nextRecord,
        ...records.filter((record) => record.Id !== nextRecord.Id)
    ];
}

export function getSearchResultStatePatch(
    result: SearchResultItem,
    currentAccounts: Account[],
    currentContacts: Contact[]
): SearchResultStatePatch {
    if (result.type === "account") {
        return {
            type: "account",
            accounts: upsertRecordById(currentAccounts, result.record),
            activeTab: "accounts",
            selectedAccountId: result.record.Id,
            selectedContactId: null
        };
    }

    return {
        type: "contact",
        contacts: upsertRecordById(currentContacts, result.record),
        activeTab: "contacts",
        selectedAccountId: null,
        selectedContactId: result.record.Id
    };
}
