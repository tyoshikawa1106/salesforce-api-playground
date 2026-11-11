import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/salesforce/client-core";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { createOauthState, setStateCookie } from "@/lib/salesforce/session";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const config = getSalesforceConfig();
        const state = createOauthState();
        const codeVerifier = randomBytes(32).toString("base64url");
        const authorizeUrl = buildAuthorizationUrl(config, state, codeVerifier);

        const response = NextResponse.redirect(authorizeUrl);
        setStateCookie(response, [state, codeVerifier].join("."));
        return response;
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to start OAuth flow." },
            { status: 500 }
        );
    }
}
