import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createIntegrationAccountMutation,
    deleteRecordMutation,
    restoreRecycleBinItemsMutation,
    saveAccountMutation,
    saveContactMutation
} from "./mutations";
import { blankAccount, blankContact } from "./record-forms";
import { accountFixture, contactFixture } from "../utils/test-fixtures";
import type { DeleteState, ModalState } from "../utils/types";

afterEach(() => {
    vi.unstubAllGlobals();
});

function stubSuccessfulFetch(id = "001xx000003DGbY") {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ id, success: true }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("playground record mutations", () => {
    it("creates and updates accounts through the expected API routes", async () => {
        const fetchMock = stubSuccessfulFetch();

        await expect(saveAccountMutation(null, { ...blankAccount, Name: "Acme" })).resolves.toEqual({
            message: "取引先を作成しました。",
            createdId: "001xx000003DGbY"
        });

        const editModal: ModalState = { type: "account", mode: "edit", record: accountFixture };
        await expect(saveAccountMutation(editModal, { ...blankAccount, Name: "Updated Acme" })).resolves.toEqual({
            message: "取引先を更新しました。"
        });

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "/api/accounts",
            expect.objectContaining({ method: "POST" })
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            `/api/accounts/${accountFixture.Id}`,
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("creates and updates contacts through the expected API routes", async () => {
        const fetchMock = stubSuccessfulFetch("003xx000004TmiQ");

        await expect(saveContactMutation(null, { ...blankContact, LastName: "Yamada" })).resolves.toEqual({
            message: "取引先責任者を作成しました。",
            createdId: "003xx000004TmiQ"
        });

        const editModal: ModalState = { type: "contact", mode: "edit", record: contactFixture };
        await expect(saveContactMutation(editModal, { ...blankContact, LastName: "Suzuki" })).resolves.toEqual({
            message: "取引先責任者を更新しました。"
        });

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "/api/contacts",
            expect.objectContaining({ method: "POST" })
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            `/api/contacts/${contactFixture.Id}`,
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("creates integration accounts through the integration route", async () => {
        const fetchMock = stubSuccessfulFetch();

        await expect(createIntegrationAccountMutation({ ...blankAccount, Name: "Integration Account" })).resolves.toBe(
            "連携ユーザーで取引先を作成しました。"
        );

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/integration/ui/accounts",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("deletes records through the matching resource route", async () => {
        const fetchMock = stubSuccessfulFetch();
        const deleteState: DeleteState = { type: "contact", ids: [contactFixture.Id], label: "Taro Yamada" };

        await expect(deleteRecordMutation(deleteState)).resolves.toBe("Taro Yamada を削除しました。");

        expect(fetchMock).toHaveBeenCalledWith(
            `/api/contacts/${contactFixture.Id}`,
            expect.objectContaining({ method: "DELETE" })
        );
    });

    it("deletes multiple selected records through the collection resource route", async () => {
        const fetchMock = stubSuccessfulFetch();
        const deleteState: DeleteState = {
            type: "account",
            ids: [accountFixture.Id, "001xx000003DGbZ"],
            label: "選択した取引先 2 件"
        };

        await expect(deleteRecordMutation(deleteState)).resolves.toBe("選択した取引先 2 件を削除しました。");

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/accounts",
            expect.objectContaining({
                method: "DELETE",
                body: JSON.stringify({ ids: [accountFixture.Id, "001xx000003DGbZ"] })
            })
        );
    });

    it("restores recycle bin items through the mixed undelete route", async () => {
        const fetchMock = stubSuccessfulFetch();

        await expect(
            restoreRecycleBinItemsMutation([
                {
                    objectApiName: "Account",
                    objectLabel: "取引先",
                    id: accountFixture.Id,
                    name: accountFixture.Name
                },
                {
                    objectApiName: "Contact",
                    objectLabel: "取引先責任者",
                    id: contactFixture.Id,
                    name: "Taro Yamada"
                }
            ])
        ).resolves.toBe("2 件を復元しました。");

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/recycle-bin/undelete",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({
                    items: [
                        { objectApiName: "Account", id: accountFixture.Id },
                        { objectApiName: "Contact", id: contactFixture.Id }
                    ]
                })
            })
        );
    });

});
