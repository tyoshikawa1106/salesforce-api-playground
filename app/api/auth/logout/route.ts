import { NextRequest, NextResponse } from "next/server";
import { logServerError } from "@/lib/server-log";
import { revokeSalesforceSession, salesforceErrorResponse } from "@/lib/salesforce/client";
import { assertSameOriginRequest } from "@/lib/salesforce/request-security";
import {
    clearSessionCookie,
    clearStateCookie,
    getSession
} from "@/lib/salesforce/session";
import { getConfiguredAppOrigin } from "@/lib/salesforce/urls";

export const dynamic = "force-dynamic";

function handleRevokeError(error: unknown): void {
    logServerError("Salesforce token revocation failed during logout.", error);
}

export async function POST(request: NextRequest) {
    try {
        assertSameOriginRequest(request);
    } catch (error) {
        return salesforceErrorResponse(error);
    }

    const session = await getSession();

    if (session) {
        try {
            await revokeSalesforceSession(session);
        } catch (error) {
            handleRevokeError(error);
        }
    }

    const response = NextResponse.redirect(new URL("/", getConfiguredAppOrigin()));
    clearSessionCookie(response);
    clearStateCookie(response);
    return response;
}
