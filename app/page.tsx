import { headers } from "next/headers";
import Playground from "@/components/Playground";
import { getEnvironmentLabel } from "@/lib/environment-label";

export const dynamic = "force-dynamic";

export default async function Home() {
    const requestHeaders = await headers();
    const requestHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    return <Playground environmentLabel={getEnvironmentLabel(process.env, requestHost)} />;
}
