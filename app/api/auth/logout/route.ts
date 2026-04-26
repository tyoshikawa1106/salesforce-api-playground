import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/salesforce/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  clearSessionCookie(response);
  return response;
}
