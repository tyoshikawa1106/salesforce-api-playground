import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, salesforceErrorResponse } from "@/lib/salesforce/client";
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
  const expectedState = cookies().get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    const response = NextResponse.redirect(new URL("/?auth=state_error", request.url));
    clearStateCookie(response);
    return response;
  }

  try {
    const session = await exchangeCodeForToken(code);
    const response = NextResponse.redirect(new URL("/?auth=connected", request.url));
    clearStateCookie(response);
    setSessionCookie(response, session);
    return response;
  } catch (error) {
    return salesforceErrorResponse(error);
  }
}
