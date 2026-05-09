import { describe, expect, it } from "vitest";
import {
  buildPlaygroundApiRequest,
  compactPayload,
  playgroundApiPaths
} from "./playground-api";

describe("playgroundApiPaths", () => {
  it("builds app API paths for Salesforce playground resources", () => {
    expect(playgroundApiPaths.session).toBe("/api/session");
    expect(playgroundApiPaths.accounts).toBe("/api/accounts");
    expect(playgroundApiPaths.contacts).toBe("/api/contacts");
    expect(playgroundApiPaths.record("accounts", "001xx000003DGbY")).toBe(
      "/api/accounts/001xx000003DGbY"
    );
  });
});

describe("buildPlaygroundApiRequest", () => {
  it("builds a JSON API request without changing GET defaults", () => {
    expect(buildPlaygroundApiRequest(playgroundApiPaths.accounts)).toEqual({
      url: "/api/accounts",
      init: {
        headers: {
          "content-type": "application/json"
        }
      }
    });
  });

  it("builds method and JSON body for mutations", () => {
    expect(
      buildPlaygroundApiRequest(playgroundApiPaths.contacts, {
        method: "POST",
        body: {
          LastName: "Yamada",
          Email: undefined
        }
      })
    ).toEqual({
      url: "/api/contacts",
      init: {
        headers: {
          "content-type": "application/json"
        },
        method: "POST",
        body: "{\"LastName\":\"Yamada\"}"
      }
    });
  });
});

describe("compactPayload", () => {
  it("trims form values and omits empty values for create requests", () => {
    expect(
      compactPayload({
        Name: " Acme ",
        Phone: " "
      })
    ).toEqual({
      Name: "Acme",
      Phone: undefined
    });
  });

  it("turns empty values into null for update requests", () => {
    expect(
      compactPayload(
        {
          Name: " Acme ",
          Phone: " "
        },
        { emptyAsNull: true }
      )
    ).toEqual({
      Name: "Acme",
      Phone: null
    });
  });
});
