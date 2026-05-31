export type EnvironmentLabel = {
    label: string;
};

type EnvironmentVariables = {
    [key: string]: string | undefined;
    APP_ENV?: string;
    APP_ENV_LABEL?: string;
};

const productionEnvironmentNames = new Set(["main", "production", "prod"]);

export function getEnvironmentLabel(env: EnvironmentVariables = process.env): EnvironmentLabel | null {
    const environmentName = env.APP_ENV?.trim();
    if (!environmentName) {
        return null;
    }

    if (productionEnvironmentNames.has(environmentName.toLowerCase())) {
        return null;
    }

    const label = env.APP_ENV_LABEL?.trim() || environmentName;
    return { label };
}
