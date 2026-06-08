import { NextResponse } from "next/server";
import { getSession } from "@/lib/salesforce/session";
import { getCurrentUserName } from "@/services/salesforce/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getSession();
    let userName: string | undefined;

    if (session?.userId) {
        try {
            userName = (await getCurrentUserName()).data;
        } catch {
            userName = undefined;
        }
    }

    return NextResponse.json({
        connected: Boolean(session),
        instanceUrl: session?.instanceUrl,
        issuedAt: session?.issuedAt,
        userId: session?.userId,
        userName
    });
}
