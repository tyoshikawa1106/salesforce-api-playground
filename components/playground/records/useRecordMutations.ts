import { useState } from "react";
import { useRecordModalState } from "./useRecordModalState";
import { useRecordMutationActions } from "./useRecordMutationActions";
import type { Activity, Notice } from "../utils/types";

type UseRecordMutationsOptions = {
    loadAll: () => Promise<void>;
    onActivityDeleted?: () => void;
    onActivitySaved?: (activity: Activity) => Promise<void>;
    onAccountCreated?: (accountId: string) => void;
    onContactCreated?: (contactId: string) => void;
    showNotice: (notice: Notice) => void;
};

export function useRecordMutations({
    loadAll,
    onActivityDeleted,
    onActivitySaved,
    onAccountCreated,
    onContactCreated,
    showNotice
}: UseRecordMutationsOptions) {
    const [saving, setSaving] = useState(false);
    const modalState = useRecordModalState();
    const actions = useRecordMutationActions({
        ...modalState,
        loadAll,
        onActivityDeleted,
        onActivitySaved,
        onAccountCreated,
        onContactCreated,
        saving,
        setSaving,
        showNotice
    });

    return {
        ...modalState,
        ...actions,
        saving
    };
}
