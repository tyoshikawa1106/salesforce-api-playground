import { headers } from "next/headers";
import Playground from "@/components/Playground";
import { getEnvironmentLabel } from "@/lib/environment-label";

export async function PlaygroundPage() {
    const requestHeaders = await headers();
    const requestHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    return <Playground environmentLabel={getEnvironmentLabel(process.env, requestHost)} />;
}
