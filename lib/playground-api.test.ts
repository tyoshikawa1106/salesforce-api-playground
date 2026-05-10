import { describe, expect, it } from "vitest";
import {
  buildAccountCreatePayload,
  buildAccountUpdatePayload,
  buildContactCreatePayload,
  buildContactUpdatePayload,
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

describe("form payload builders", () => {
  it("builds account create and update payloads with the existing empty value rules", () => {
    const form = {
      Name: " Acme ",
      Phone: " ",
      Website: " https://example.test ",
      Industry: "",
      Type: "",
      BillingCity: " Tokyo ",
      BillingCountry: ""
    };

    expect(buildAccountCreatePayload(form)).toEqual({
      Name: "Acme",
      Phone: undefined,
      Website: "https://example.test",
      Industry: undefined,
      Type: undefined,
      BillingCity: "Tokyo",
      BillingCountry: undefined
    });
    expect(buildAccountUpdatePayload(form)).toEqual({
      Name: "Acme",
      Phone: null,
      Website: "https://example.test",
      Industry: null,
      Type: null,
      BillingCity: "Tokyo",
      BillingCountry: null
    });
  });

  it("builds contact create and update payloads with the existing empty value rules", () => {
    const form = {
      FirstName: " Taro ",
      LastName: " Yamada ",
      Email: " ",
      Phone: "",
      Title: " Manager ",
      AccountId: ""
    };

    expect(buildContactCreatePayload(form)).toEqual({
      FirstName: "Taro",
      LastName: "Yamada",
      Email: undefined,
      Phone: undefined,
      Title: "Manager",
      AccountId: undefined
    });
    expect(buildContactUpdatePayload(form)).toEqual({
      FirstName: "Taro",
      LastName: "Yamada",
      Email: null,
      Phone: null,
      Title: "Manager",
      AccountId: null
    });
  });
});
