export type EnvironmentLabel = {
    label: string;
};

type EnvironmentVariables = {
    [key: string]: string | undefined;
    APP_ENV?: string;
    APP_ENV_LABEL?: string;
};

const productionEnvironmentNames = new Set(["main", "production", "prod"]);
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function getHostnameFromRequestHost(requestHost?: string | null): string {
    const host = requestHost?.split(",")[0]?.trim().toLowerCase();
    if (!host) {
        return "";
    }

    if (host.startsWith("[")) {
        return host.slice(1, host.indexOf("]"));
    }

    return host.split(":")[0] ?? "";
}

function getLocalEnvironmentName(requestHost?: string | null): string {
    return localHostnames.has(getHostnameFromRequestHost(requestHost)) ? "local" : "";
}

export function getEnvironmentLabel(env: EnvironmentVariables = process.env, requestHost?: string | null): EnvironmentLabel | null {
    const environmentName = env.APP_ENV?.trim() || getLocalEnvironmentName(requestHost);
    if (!environmentName) {
        return null;
    }

    if (productionEnvironmentNames.has(environmentName.toLowerCase())) {
        return null;
    }

    const label = env.APP_ENV_LABEL?.trim() || (environmentName === "local" ? "LOCAL" : environmentName);
    return { label };
}
