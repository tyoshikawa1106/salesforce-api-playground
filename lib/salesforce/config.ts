import { DEFAULT_SALESFORCE_API_VERSION } from "./api-version";
import {
    normalizeAppRedirectUri,
    normalizeHttpsOriginUrl
} from "./url-security";

export type SalesforceConfig = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    loginUrl: string;
    apiVersion: string;
    sessionSecret: string;
};

export type SalesforceIntegrationConfig = {
    clientId: string;
    clientSecret: string;
    loginUrl: string;
    apiVersion: string;
    apiKey: string;
};

export function getSalesforceConfig(): SalesforceConfig {
    const config = {
        clientId: process.env.SALESFORCE_CLIENT_ID ?? "",
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
        redirectUri: process.env.SALESFORCE_REDIRECT_URI ?? "",
        loginUrl: process.env.SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com",
        apiVersion: DEFAULT_SALESFORCE_API_VERSION,
        sessionSecret: process.env.SESSION_SECRET ?? ""
    };

    const missing = Object.entries(config)
        .filter(([key, value]) => key !== "apiVersion" && key !== "loginUrl" && !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    if (config.sessionSecret.length < 32) {
        throw new Error("SESSION_SECRET must be at least 32 characters.");
    }

    return {
        ...config,
        redirectUri: normalizeAppRedirectUri(config.redirectUri, "SALESFORCE_REDIRECT_URI"),
        loginUrl: normalizeHttpsOriginUrl(config.loginUrl, "SALESFORCE_LOGIN_URL")
    };
}

export function getSalesforceIntegrationConfig(): SalesforceIntegrationConfig {
    const config = {
        clientId: process.env.SALESFORCE_INTEGRATION_CLIENT_ID ?? "",
        clientSecret: process.env.SALESFORCE_INTEGRATION_CLIENT_SECRET ?? "",
        loginUrl: process.env.SALESFORCE_INTEGRATION_LOGIN_URL ?? "",
        apiVersion: DEFAULT_SALESFORCE_API_VERSION,
        apiKey: process.env.INTEGRATION_API_KEY ?? ""
    };

    const missing = Object.entries(config)
        .filter(([key, value]) => key !== "apiVersion" && !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    return {
        ...config,
        loginUrl: normalizeHttpsOriginUrl(
            config.loginUrl,
            "SALESFORCE_INTEGRATION_LOGIN_URL"
        )
    };
}
