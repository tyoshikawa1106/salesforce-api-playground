import type { PlaygroundApiRequest } from "@/lib/playground-api";
import type { Notice } from "./types";

export class PlaygroundApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

export async function apiRequest<T>({ url, init }: PlaygroundApiRequest): Promise<T> {
    const response = await fetch(url, init);
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        throw new PlaygroundApiError(data?.error ?? "Request failed.", response.status);
    }

    return data as T;
}

export async function saveRecord(
    runMutation: () => Promise<string>,
    fallbackErrorMessage: string
): Promise<Notice> {
    try {
        return { tone: "success", message: await runMutation() };
    } catch (error) {
        return {
            tone: "error",
            message: error instanceof Error ? error.message : fallbackErrorMessage
        };
    }
}
