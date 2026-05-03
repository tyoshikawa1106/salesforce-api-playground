import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/salesforce/client-core";
import { getSalesforceConfig } from "@/lib/salesforce/config";
import { createOauthState, setStateCookie } from "@/lib/salesforce/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getSalesforceConfig();
    const state = createOauthState();
    const authorizeUrl = buildAuthorizationUrl(config, state);

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
