import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";

function ListViewToolbar({
    count,
    objectLabel,
    objectLabelPlural
}: {
    count: number;
    objectLabel: string;
    objectLabelPlural: string;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div className="slds-text-title_bold">
                {count} 件 - ビュー: 自分の{objectLabelPlural}
            </div>
            <div className="slds-grid slds-grid_vertical-align-center">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor={`${objectLabel.toLowerCase()}-list-search`}>
                        このリストを検索
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true" />
                        <input
                            id={`${objectLabel.toLowerCase()}-list-search`}
                            className="slds-input slds-max-medium-size_full playground-list-search"
                            type="search"
                            placeholder="このリストを検索..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AccountPanel({
    accounts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-theme_default">
            <ListViewToolbar count={accounts.length} objectLabel="取引先" objectLabelPlural="取引先" />
            {loading ? <EmptyState message="取引先を読み込んでいます..." /> : null}
            {!loading && accounts.length === 0 ? <EmptyState message={connected ? "取引先が見つかりません。" : "Salesforce に接続すると取引先を読み込めます。"} /> : null}
            {!loading && accounts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">行番号</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="すべての取引先を選択" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">取引先名</th>
                                <th scope="col">電話</th>
                                <th scope="col">Web サイト</th>
                                <th scope="col">業種</th>
                                <th scope="col">請求先</th>
                                <th scope="col">最終更新日</th>
                                <th scope="col">アクション</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account, index) => (
                                <tr className="slds-hint-parent" key={account.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`${account.Name} を選択`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={account.Name}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(account)}>
                                                {account.Name}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={account.Phone} />
                                    <TableCell value={account.Website} />
                                    <TableCell value={account.Industry} />
                                    <TableCell value={getAccountBilling(account)} />
                                    <TableCell value={formatDate(account.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(account)}>
                                                編集
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(account)}>
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

export function ContactPanel({
    contacts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-theme_default">
            <ListViewToolbar count={contacts.length} objectLabel="取引先責任者" objectLabelPlural="取引先責任者" />
            {loading ? <EmptyState message="取引先責任者を読み込んでいます..." /> : null}
            {!loading && contacts.length === 0 ? <EmptyState message={connected ? "取引先責任者が見つかりません。" : "Salesforce に接続すると取引先責任者を読み込めます。"} /> : null}
            {!loading && contacts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">行番号</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="すべての取引先責任者を選択" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">氏名</th>
                                <th scope="col">役職</th>
                                <th scope="col">取引先名</th>
                                <th scope="col">メール</th>
                                <th scope="col">電話</th>
                                <th scope="col">最終更新日</th>
                                <th scope="col">アクション</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact, index) => (
                                <tr className="slds-hint-parent" key={contact.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`${getContactName(contact)} を選択`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={getContactName(contact)}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(contact)}>
                                                {getContactName(contact)}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={contact.Title} />
                                    <TableCell value={contact.Account?.Name} />
                                    <TableCell value={contact.Email} />
                                    <TableCell value={contact.Phone} />
                                    <TableCell value={formatDate(contact.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(contact)}>
                                                編集
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(contact)}>
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

function TableCell({ value }: { value?: string }) {
    const displayValue = value || "-";
    return (
        <td>
            <div className="slds-truncate" title={displayValue}>
                {displayValue}
            </div>
        </td>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center slds-p-around_xx-large">
            <span className="slds-icon_container slds-icon-utility-info slds-m-bottom_small" aria-hidden="true">
                <span className="slds-assistive-text">情報</span>
            </span>
            <p>{message}</p>
        </div>
    );
}
