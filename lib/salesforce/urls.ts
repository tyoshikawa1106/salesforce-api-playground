import { NextRequest } from "next/server";
import { getSalesforceConfig } from "./config";

export function getConfiguredAppOrigin(): string {
  return new URL(getSalesforceConfig().redirectUri).origin;
}

export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}
