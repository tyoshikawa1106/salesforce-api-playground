import Playground from "@/components/Playground";
import { getEnvironmentLabel } from "@/lib/environment-label";

export const dynamic = "force-dynamic";

export default function Home() {
    return <Playground environmentLabel={getEnvironmentLabel()} />;
}
