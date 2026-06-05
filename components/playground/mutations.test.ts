import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createIntegrationAccountMutation,
    deleteRecordMutation,
    restoreRecycleBinItemsMutation,
    saveAccountMutation,
    saveContactMutation
} from "./mutations";
import { blankAccount, blankContact } from "./record-forms";
import type { Account, Contact, DeleteState, ModalState } from "./types";

const account: Account = {
    Id: "001xx000003DGbY",
    Name: "Acme"
};

const contact: Contact = {
    Id: "003xx000004TmiQ",
    FirstName: "Taro",
    LastName: "Yamada",
    AccountId: account.Id,
    Account: {
        Name: account.Name
    }
};

afterEach(() => {
    vi.unstubAllGlobals();
});

function stubSuccessfulFetch() {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("playground record mutations", () => {
    it("creates and updates accounts through the expected API routes", async () => {
        const fetchMock = stubSuccessfulFetch();

        await expect(saveAccountMutation(null, { ...blankAccount, Name: "Acme" })).resolves.toBe("取引先を作成しました。");

        const editModal: ModalState = { type: "account", mode: "edit", record: account };
        await expect(saveAccountMutation(editModal, { ...blankAccount, Name: "Updated Acme" })).resolves.toBe("取引先を更新しました。");

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "/api/accounts",
            expect.objectContaining({ method: "POST" })
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            `/api/accounts/${account.Id}`,
            expect.objectContaining({ method: "PATCH" })
        );
    });

    it("creates and updates contacts through the expected API routes", async () => {
        const fetchMock = stubSuccessfulFetch();

        await expect(saveContactMutation(null, { ...blankContact, LastName: "Yamada" })).resolves.toBe("取引先責任者を作成しました。");

        const editModal: ModalState = { type: "contact", mode: "edit", record: contact };
        await expect(saveContactMutation(editModal, { ...blankContact, LastName: "Suzuki" })).resolves.toBe("取引先責任者を更新しました。");

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "/api/contacts",
            expect.objectContaining({ method: "POST" })
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            `/api/contacts/${contact.Id}`,
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
        const deleteState: DeleteState = { type: "contact", ids: [contact.Id], label: "Taro Yamada" };

        await expect(deleteRecordMutation(deleteState)).resolves.toBe("Taro Yamada を削除しました。");

        expect(fetchMock).toHaveBeenCalledWith(
            `/api/contacts/${contact.Id}`,
            expect.objectContaining({ method: "DELETE" })
        );
    });

    it("deletes multiple selected records through the collection resource route", async () => {
        const fetchMock = stubSuccessfulFetch();
        const deleteState: DeleteState = {
            type: "account",
            ids: [account.Id, "001xx000003DGbZ"],
            label: "選択した取引先 2 件"
        };

        await expect(deleteRecordMutation(deleteState)).resolves.toBe("選択した取引先 2 件を削除しました。");

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/accounts",
            expect.objectContaining({
                method: "DELETE",
                body: JSON.stringify({ ids: [account.Id, "001xx000003DGbZ"] })
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
                    id: account.Id,
                    name: account.Name
                },
                {
                    objectApiName: "Contact",
                    objectLabel: "取引先責任者",
                    id: contact.Id,
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
                        { objectApiName: "Account", id: account.Id },
                        { objectApiName: "Contact", id: contact.Id }
                    ]
                })
            })
        );
    });

});
