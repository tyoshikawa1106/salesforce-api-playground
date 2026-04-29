import { NextResponse } from "next/server";
import { getSession } from "@/lib/salesforce/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSession();

  return NextResponse.json({
    connected: Boolean(session),
    instanceUrl: session?.instanceUrl,
    issuedAt: session?.issuedAt
  });
}
