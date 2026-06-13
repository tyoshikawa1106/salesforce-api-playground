import { describe, expect, it } from "vitest";
import {
    accountBulkDeleteLabel,
    accountDeleteState,
    activityDeleteState,
    contactBulkDeleteLabel,
    contactDeleteLabel,
    contactDeleteState
} from "./record-actions";
import { accountFixture, activityFixture, contactFixture } from "../utils/test-fixtures";

describe("record actions", () => {
    it("builds account delete state and bulk labels", () => {
        expect(accountBulkDeleteLabel([accountFixture])).toBe("選択した取引先 1 件");
        expect(accountDeleteState([accountFixture], accountFixture.Name)).toEqual({
            type: "account",
            ids: [accountFixture.Id],
            label: "Acme"
        });
    });

    it("builds contact delete state and labels", () => {
        expect(contactDeleteLabel(contactFixture)).toBe("Taro Yamada");
        expect(contactBulkDeleteLabel([contactFixture])).toBe("選択した取引先責任者 1 件");
        expect(contactDeleteState([contactFixture], contactDeleteLabel(contactFixture))).toEqual({
            type: "contact",
            ids: [contactFixture.Id],
            label: "Taro Yamada"
        });
    });

    it("builds activity delete state without an object label prefix", () => {
        expect(activityDeleteState(activityFixture)).toEqual({
            type: "activity",
            activityType: "task",
            ids: [activityFixture.id],
            label: "Call"
        });
    });
});
