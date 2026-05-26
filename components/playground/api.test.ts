import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, PlaygroundApiError } from "./api";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("apiRequest", () => {
    it("reads JSON responses", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn<typeof fetch>().mockResolvedValue(Response.json({ ok: true }))
        );

        await expect(apiRequest<{ ok: boolean }>({ url: "/api/session", init: {} })).resolves.toEqual({
            ok: true
        });
    });

    it("uses server JSON error messages", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn<typeof fetch>().mockResolvedValue(
                Response.json({ error: "Salesforce session expired." }, { status: 401 })
            )
        );

        await expect(apiRequest({ url: "/api/accounts", init: {} })).rejects.toMatchObject({
            message: "Salesforce session expired.",
            status: 401
        });
    });

    it("falls back cleanly when an error response is not JSON", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn<typeof fetch>().mockResolvedValue(
                new Response("Service unavailable", {
                    status: 503,
                    headers: {
                        "content-type": "text/plain"
                    }
                })
            )
        );

        const promise = apiRequest({ url: "/api/accounts", init: {} });

        await expect(promise).rejects.toBeInstanceOf(PlaygroundApiError);
        await expect(promise).rejects.toMatchObject({
            message: "Request failed.",
            status: 503
        });
    });
});
