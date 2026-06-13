import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
    AccountPanel,
    ContactPanel,
    filterAccounts,
    filterContacts,
    getSelectedVisibleRecords,
    getSelectionState
} from "./RecordLists";
import { RecycleBinPanel } from "./RecycleBinPanel";
import {
    accountFixture as account,
    contactFixture as contact,
    noop,
    recycleBinItemFixture as recycleBinItem
} from "./test-fixtures";
import type { Account, Contact } from "./types";

describe("record list smoke rendering", () => {
    it("renders account and contact list views with record actions", () => {
        const accountMarkup = renderToStaticMarkup(
            createElement(AccountPanel, {
                accounts: [account],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop,
                onBulkDelete: noop,
                onBulkDeleteEmpty: noop,
                onRefresh: noop
            })
        );
        const contactMarkup = renderToStaticMarkup(
            createElement(ContactPanel, {
                contacts: [contact],
                connected: true,
                loading: false,
                onDelete: noop,
                onEdit: noop,
                onOpen: noop,
                onOpenAccountById: noop,
                onBulkDelete: noop,
                onBulkDeleteEmpty: noop,
                onRefresh: noop
            })
        );
        const refreshActionIndex = accountMarkup.indexOf("aria-label=\"更新\"");
        const deleteActionIndex = accountMarkup.indexOf("aria-label=\"選択した取引先を削除\"");

        expect(accountMarkup).toContain("Acme");
        expect(accountMarkup).toContain("最終更新者");
        expect(accountMarkup).toContain("Admin User");
        expect(accountMarkup).toContain("1 個の項目");
        expect(accountMarkup).not.toContain("数秒前に更新されました");
        expect(accountMarkup).toContain("slds-card__body playground-list-view__body");
        expect(accountMarkup).toContain("このリストを検索...");
        expect(accountMarkup).toContain("role=\"grid\"");
        expect(accountMarkup).toContain("aria-multiselectable=\"true\"");
        expect(accountMarkup).not.toContain("slds-table_cell-buffer");
        expect(accountMarkup).toContain("slds-line-height_reset");
        expect(accountMarkup).toContain("slds-th__action slds-th__action_form");
        expect(accountMarkup).toContain("slds-cell_action-mode");
        expect(accountMarkup).toContain("role=\"gridcell\"");
        expect(accountMarkup).toContain("aria-label=\"表示中の取引先をすべて選択\"");
        expect(accountMarkup).not.toContain("ビュー: 自分の取引先");
        expect(accountMarkup).toContain("リストビューコントロール");
        expect(accountMarkup).toContain("リスト表示を選択");
        expect(accountMarkup).not.toContain("Refresh list");
        expect(accountMarkup).toContain("slds-checkbox__label");
        expect(accountMarkup).toContain("slds-text-align_right slds-cell_action-mode");
        expect(accountMarkup).toContain("aria-label=\"選択した取引先を削除\"");
        expect(refreshActionIndex).toBeGreaterThan(-1);
        expect(refreshActionIndex).toBeLessThan(deleteActionIndex);
        expect(accountMarkup).toContain("slds-m-left_x-small");
        expect(accountMarkup).not.toContain("playground-list-selection");
        expect(accountMarkup).toContain("slds-dropdown-trigger slds-dropdown-trigger_click");
        expect(accountMarkup).toContain("slds-button_icon-border-filled slds-button_icon-x-small");
        expect(accountMarkup).toContain("aria-haspopup=\"true\"");
        expect(accountMarkup).toContain("aria-expanded=\"false\"");
        expect(accountMarkup).toContain("slds-dropdown slds-dropdown_right");
        expect(accountMarkup).toContain("slds-dropdown__list");
        expect(accountMarkup).toContain("role=\"menuitem\"");
        expect(accountMarkup).toContain("編集");
        expect(accountMarkup).toContain("削除");
        expect(accountMarkup).not.toContain("slds-has-divider_top-space");
        expect(accountMarkup).not.toContain("選択を解除");
        expect(accountMarkup).not.toContain("件の取引先を選択中");
        expect(accountMarkup).not.toContain("slds-button_destructive");
        expect(accountMarkup).not.toContain("slds-button-group");
        expect(accountMarkup).not.toContain("slds-row-number");
        expect(accountMarkup).not.toContain("data-label=\"行番号\"");
        expect(contactMarkup).toContain("Taro Yamada");
        expect(contactMarkup).toContain("最終更新者");
        expect(contactMarkup).toContain("Sales User");
        expect(contactMarkup).toContain("1 個の項目");
        expect(contactMarkup).toContain("Manager");
        expect(contactMarkup).toContain("aria-label=\"表示中の取引先責任者をすべて選択\"");
        expect(contactMarkup).toContain("aria-label=\"選択した取引先責任者を削除\"");
        expect(contactMarkup).not.toContain("ビュー: 自分の取引先責任者");
    });

    it("renders recycle bin list with mixed object restore controls", () => {
        const markup = renderToStaticMarkup(
            createElement(RecycleBinPanel, {
                items: [recycleBinItem],
                loading: false,
                onRestore: noop,
                onRestoreEmpty: noop,
                onRefresh: noop
            })
        );
        const objectIconIndex = markup.indexOf("slds-icon-standard-account");
        const objectLabelIndex = markup.indexOf("title=\"取引先\">取引先");

        expect(markup).toContain("最近削除された項目");
        expect(markup).not.toContain("完全に削除");
        expect(markup).not.toContain("Recycle Bin に残っている Account / Contact を表示します。");
        expect(markup).toContain("復元");
        expect(markup).toContain("1 個の項目");
        expect(markup).toContain("aria-label=\"更新\"");
        expect(markup).not.toContain("このリストを検索");
        expect(markup).toContain("aria-label=\"表示中の項目をすべて選択\"");
        expect(markup).toContain("ごみ箱の項目一覧");
        expect(markup).toContain("取引先");
        expect(objectIconIndex).toBeGreaterThan(-1);
        expect(objectIconIndex).toBeLessThan(objectLabelIndex);
        expect(markup).toContain("Acme");
        expect(markup).toContain("削除したユーザー");
        expect(markup).toContain("Taro Admin");
    });

    it("filters account and contact list records by visible list values", () => {
        const anotherAccount: Account = {
            ...account,
            Id: "001xx000003DGbZ",
            Name: "Global Media",
            Phone: "03-9999-9999",
            Website: "https://global.example.test",
            Industry: "Media",
            BillingCity: "Osaka"
        };
        const anotherContact: Contact = {
            ...contact,
            Id: "003xx000004TmiR",
            FirstName: "Hanako",
            LastName: "Suzuki",
            Email: "hanako@example.test",
            Title: "Designer",
            AccountId: anotherAccount.Id,
            Account: {
                Name: anotherAccount.Name
            }
        };

        expect(filterAccounts([account, anotherAccount], "media")).toEqual([anotherAccount]);
        expect(filterAccounts([account, anotherAccount], " TOKYO ")).toEqual([account]);
        expect(filterContacts([contact, anotherContact], "designer")).toEqual([anotherContact]);
        expect(filterContacts([contact, anotherContact], "acme")).toEqual([contact]);
    });

    it("reports visible list selection state for checked and mixed header checkboxes", () => {
        const anotherAccount: Account = {
            ...account,
            Id: "001xx000003DGbZ",
            Name: "Global Media"
        };

        expect(getSelectionState([account, anotherAccount], new Set([account.Id]))).toEqual({
            allVisibleSelected: false,
            someVisibleSelected: true,
            selectedVisibleCount: 1
        });
        expect(getSelectionState([account, anotherAccount], new Set([account.Id, anotherAccount.Id]))).toEqual({
            allVisibleSelected: true,
            someVisibleSelected: false,
            selectedVisibleCount: 2
        });
        expect(getSelectionState([anotherAccount], new Set([account.Id]))).toEqual({
            allVisibleSelected: false,
            someVisibleSelected: false,
            selectedVisibleCount: 0
        });
        expect(getSelectedVisibleRecords([account, anotherAccount], new Set([anotherAccount.Id]))).toEqual([anotherAccount]);
    });
});
