import { NextRequest, NextResponse } from "next/server";
import { revokeSalesforceSession, salesforceErrorResponse } from "@/lib/salesforce/client";
import {
  clearSessionCookie,
  clearStateCookie,
  getSession
} from "@/lib/salesforce/session";
import { getRequestOrigin } from "@/lib/salesforce/urls";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = getSession();

  if (session) {
    try {
      await revokeSalesforceSession(session);
    } catch (error) {
      return salesforceErrorResponse(error);
    }
  }

  const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
  clearSessionCookie(response);
  clearStateCookie(response);
  return response;
}
