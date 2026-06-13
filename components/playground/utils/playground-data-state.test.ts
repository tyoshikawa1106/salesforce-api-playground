import { describe, expect, it } from "vitest";
import { getSearchResultStatePatch, keepSelectedRecordId, upsertRecordById } from "./playground-data-state";
import { accountFixture, contactFixture } from "./test-fixtures";

describe("playground data state helpers", () => {
    it("keeps selected ids only while the record still exists", () => {
        expect(keepSelectedRecordId(accountFixture.Id, [accountFixture])).toBe(accountFixture.Id);
        expect(keepSelectedRecordId("001xx000003Missing", [accountFixture])).toBeNull();
        expect(keepSelectedRecordId(null, [accountFixture])).toBeNull();
    });

    it("upserts records at the front without duplicating ids", () => {
        expect(upsertRecordById([{ ...accountFixture, Name: "Old Acme" }], accountFixture)).toEqual([accountFixture]);
        expect(upsertRecordById([], accountFixture)).toEqual([accountFixture]);
    });

    it("builds account search result state patches", () => {
        expect(
            getSearchResultStatePatch({ type: "account", record: accountFixture }, [], [contactFixture])
        ).toEqual({
            type: "account",
            accounts: [accountFixture],
            activeTab: "accounts",
            selectedAccountId: accountFixture.Id,
            selectedContactId: null
        });
    });

    it("builds contact search result state patches", () => {
        expect(
            getSearchResultStatePatch({ type: "contact", record: contactFixture }, [accountFixture], [])
        ).toEqual({
            type: "contact",
            contacts: [contactFixture],
            activeTab: "contacts",
            selectedAccountId: null,
            selectedContactId: contactFixture.Id
        });
    });
});
