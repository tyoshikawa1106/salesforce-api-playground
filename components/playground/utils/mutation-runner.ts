import type { Dispatch, SetStateAction } from "react";
import type { Notice } from "./types";

export type MutationRunnerOptions = {
    runMutation: () => Promise<string>;
    fallbackErrorMessage: string;
    onSuccess?: () => Promise<void> | void;
    onError?: () => Promise<void> | void;
};

export async function runMutationWithNotice({
    fallbackErrorMessage,
    onError,
    onSuccess,
    runMutation,
    setSaving,
    showNotice
}: MutationRunnerOptions & {
    setSaving: Dispatch<SetStateAction<boolean>>;
    showNotice: (notice: Notice) => void;
}) {
    setSaving(true);
    try {
        showNotice({ tone: "success", message: await runMutation() });
        await onSuccess?.();
    } catch (error) {
        showNotice({
            tone: "error",
            message: error instanceof Error ? error.message : fallbackErrorMessage
        });
        await onError?.();
    } finally {
        setSaving(false);
    }
}
