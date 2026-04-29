import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/salesforce/session";
import { getRequestOrigin } from "@/lib/salesforce/urls";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", getRequestOrigin(request)));
  clearSessionCookie(response);
  return response;
}
