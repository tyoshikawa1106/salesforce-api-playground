import type { Dispatch, SetStateAction } from "react";
import type { Notice } from "./types";

export type MutationRunnerResult = string | {
    message: string;
};

export type MutationRunnerOptions<TResult extends MutationRunnerResult = string> = {
    runMutation: () => Promise<TResult>;
    fallbackErrorMessage: string;
    onSuccess?: (result: TResult) => Promise<void> | void;
    onError?: () => Promise<void> | void;
};

function getMutationMessage(result: MutationRunnerResult) {
    return typeof result === "string" ? result : result.message;
}

export async function runMutationWithNotice<TResult extends MutationRunnerResult = string>({
    fallbackErrorMessage,
    onError,
    onSuccess,
    runMutation,
    setSaving,
    showNotice
}: MutationRunnerOptions<TResult> & {
    setSaving: Dispatch<SetStateAction<boolean>>;
    showNotice: (notice: Notice) => void;
}) {
    setSaving(true);
    try {
        const result = await runMutation();
        showNotice({ tone: "success", message: getMutationMessage(result) });
        await onSuccess?.(result);
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
