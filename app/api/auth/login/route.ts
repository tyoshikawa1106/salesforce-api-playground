import { NextResponse } from "next/server";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { createOauthState, setStateCookie } from "@/lib/salesforce/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getSalesforceConfig();
    const state = createOauthState();
    const authorizeUrl = new URL(`${config.loginUrl}/services/oauth2/authorize`);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", config.clientId);
    authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizeUrl.searchParams.set("scope", "api refresh_token");
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl);
    setStateCookie(response, state);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start OAuth flow." },
      { status: 500 }
    );
  }
}
