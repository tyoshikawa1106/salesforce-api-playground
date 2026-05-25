import { NextRequest, NextResponse } from "next/server";
import { logServerError } from "@/lib/server-log";
import { revokeSalesforceSession } from "@/lib/salesforce/client";
import {
    clearSessionCookie,
    clearStateCookie,
    getSession
} from "@/lib/salesforce/session";
import { getRequestOrigin } from "@/lib/salesforce/urls";

export const dynamic = "force-dynamic";

function handleRevokeError(error: unknown): void {
    logServerError("Salesforce token revocation failed during logout.", error);
}

export async function POST(request: NextRequest) {
    const session = await getSession();

    if (session) {
        try {
            await revokeSalesforceSession(session);
        } catch (error) {
            handleRevokeError(error);
        }
    }

    const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
    clearSessionCookie(response);
    clearStateCookie(response);
    return response;
}
