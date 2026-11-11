import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, salesforceErrorResponse } from "@/lib/salesforce/client";
import { getConfiguredAppOrigin } from "@/lib/salesforce/urls";
import {
    STATE_COOKIE,
    clearStateCookie,
    setSessionCookie
} from "@/lib/salesforce/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const savedAttempt = (await cookies()).get(STATE_COOKIE)?.value ?? "";
    const [expectedState, codeVerifier] = savedAttempt.split(".");

    if (!code || !state || state !== expectedState || !codeVerifier) {
        const response = NextResponse.redirect(new URL("/?auth=state_error", getConfiguredAppOrigin()));
        clearStateCookie(response);
        return response;
    }

    try {
        const session = await exchangeCodeForToken(code, codeVerifier);
        const response = NextResponse.redirect(new URL("/?auth=connected", getConfiguredAppOrigin()));
        clearStateCookie(response);
        setSessionCookie(response, session);
        return response;
    } catch (error) {
        const response = salesforceErrorResponse(error);
        clearStateCookie(response);
        return response;
    }
}
