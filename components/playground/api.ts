import type { PlaygroundApiRequest } from "@/lib/playground-api";

export class PlaygroundApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
    }
}

async function readResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        return response.text();
    }

    return response.json();
}

function getErrorMessage(data: unknown): string {
    if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
    ) {
        return data.error;
    }

    return "リクエストに失敗しました。";
}

export async function apiRequest<T>({ url, init }: PlaygroundApiRequest): Promise<T> {
    const response = await fetch(url, init);
    const data = await readResponseBody(response);

    if (!response.ok) {
        throw new PlaygroundApiError(getErrorMessage(data), response.status);
    }

    return data as T;
}
