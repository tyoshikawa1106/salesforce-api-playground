import { describe, expect, it } from "vitest";
import { SalesforceApiError, soql } from "./client";

describe("soql", () => {
  it("combines template parts without calling Salesforce", () => {
    const objectName = "Account";
    const limit = "10";

    expect(soql`SELECT Id, Name FROM ${objectName} LIMIT ${limit}`).toBe(
      "SELECT Id, Name FROM Account LIMIT 10"
    );
  });
});

describe("SalesforceApiError", () => {
  it("keeps status and details for API error responses", () => {
    const details = [{ message: "bad request", errorCode: "INVALID_FIELD" }];
    const error = new SalesforceApiError("Salesforce API request failed.", 400, details);

    expect(error.message).toBe("Salesforce API request failed.");
    expect(error.status).toBe(400);
    expect(error.details).toBe(details);
  });
});
