export type SalesforceConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  loginUrl: string;
  apiVersion: string;
  sessionSecret: string;
};

export function getSalesforceConfig(): SalesforceConfig {
  const config = {
    clientId: process.env.SALESFORCE_CLIENT_ID ?? "",
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET ?? "",
    redirectUri: process.env.SALESFORCE_REDIRECT_URI ?? "",
    loginUrl: process.env.SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com",
    apiVersion: process.env.SALESFORCE_API_VERSION ?? "v60.0",
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

  return config;
}
