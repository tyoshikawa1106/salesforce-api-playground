import { expect, vi, type MockedFunction } from "vitest";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { SalesforceConfig } from "@/lib/salesforce/config";
import type { SalesforceSession } from "@/lib/salesforce/session";

export const dummySalesforceConfig: SalesforceConfig = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "https://app.example.test/api/auth/callback",
    loginUrl: "https://login.example.test",
    apiVersion: "v60.0",
    sessionSecret: "test-session-secret-with-32-chars"
};

export const dummySalesforceSession: SalesforceSession = {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    instanceUrl: "https://example.my.salesforce.test",
    issuedAt: 1710000000000,
    userId: "005xx0000012345"
};

export function nextRequest(
    url: string,
    init?: ConstructorParameters<typeof NextRequest>[1]
): NextRequest {
    return new NextRequest(url, init);
}

export function jsonRequest(body: unknown, method = "POST"): Request {
    return new Request("https://app.example.test/api", {
        method,
        body: JSON.stringify(body)
    });
}

export async function expectJson(response: Response, expected: unknown): Promise<void> {
    await expect(response.json()).resolves.toEqual(expected);
}

export function mockOauthStateCookie(
    cookiesMock: MockedFunction<typeof cookies>,
    cookieName: string,
    value?: string
): void {
    cookiesMock.mockReturnValue({
        get: vi.fn((name: string) => (name === cookieName && value ? { value } : undefined))
    } as unknown as ReturnType<typeof cookies>);
}

