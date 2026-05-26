import { getSalesforceConfig } from "./config";

export function getConfiguredAppOrigin(): string {
    return new URL(getSalesforceConfig().redirectUri).origin;
}
