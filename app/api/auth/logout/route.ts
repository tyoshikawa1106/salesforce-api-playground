import { NextRequest, NextResponse } from "next/server";
import { revokeSalesforceSession } from "@/lib/salesforce/client";
import { clearSessionCookie, getSession } from "@/lib/salesforce/session";
import { getRequestOrigin } from "@/lib/salesforce/urls";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = getSession();

  if (session) {
    try {
      await revokeSalesforceSession(session);
    } catch (error) {
      console.warn(
        "Salesforce token revoke failed during logout:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
  clearSessionCookie(response);
  return response;
}
