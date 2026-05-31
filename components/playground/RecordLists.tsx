"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";

function ListViewToolbar({
    count,
    selectedCount,
    searchId,
    searchValue,
    objectLabel,
    onClearSelection,
    onSearchChange
}: {
    count: number;
    selectedCount: number;
    searchId: string;
    searchValue: string;
    objectLabel: string;
    onClearSelection: () => void;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div>
                <div className="slds-text-title_bold">
                    {count} 件
                </div>
                {selectedCount > 0 ? (
                    <div className="slds-grid slds-grid_vertical-align-center slds-m-top_xx-small playground-list-selection-summary">
                        <span className="slds-text-body_small slds-m-right_small">
                            {selectedCount} 件の{objectLabel}を選択中
                        </span>
                        <button className="slds-button slds-button_neutral" type="button" onClick={onClearSelection}>
                            選択を解除
                        </button>
                    </div>
                ) : null}
            </div>
            <div className="slds-grid slds-grid_vertical-align-center">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor={searchId}>
                        このリストを検索
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true" />
                        <input
                            id={searchId}
                            className="slds-input slds-max-medium-size_full playground-list-search"
                            type="search"
                            value={searchValue}
                            placeholder="このリストを検索..."
                            onChange={(event) => onSearchChange(event.target.value)}
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
    onDelete
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
}) {
    const listState = useRecordListState(accounts, filterAccounts);

    return (
        <div className="slds-theme_default">
            <ListViewToolbar
                count={listState.filteredRecords.length}
                selectedCount={listState.selectedIds.size}
                searchId="account-list-search"
                searchValue={listState.searchTerm}
                objectLabel="取引先"
                onClearSelection={listState.clearSelection}
                onSearchChange={listState.setSearchTerm}
            />
            <RecordListEmptyStates
                loading={loading}
                hasRecords={listState.hasRecords}
                hasFilteredRecords={listState.hasFilteredRecords}
                connected={connected}
                loadingMessage="取引先を読み込んでいます..."
                emptyMessage="取引先が見つかりません。"
                disconnectedMessage="Salesforce に接続すると取引先を読み込めます。"
                filteredEmptyMessage="検索条件に一致する取引先が見つかりません。"
            />
            {!loading && listState.hasFilteredRecords ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">行番号</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <SelectionCheckbox
                                        ariaLabel="表示中の取引先をすべて選択"
                                        checked={listState.selectionState.allVisibleSelected}
                                        mixed={listState.selectionState.someVisibleSelected}
                                        onChange={listState.toggleVisibleSelection}
                                    />
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
                            {listState.filteredRecords.map((account, index) => (
                                <tr className="slds-hint-parent" key={account.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <SelectionCheckbox
                                            ariaLabel={`${account.Name} を選択`}
                                            checked={listState.selectedIds.has(account.Id)}
                                            mixed={false}
                                            onChange={() => listState.toggleSelection(account.Id)}
                                        />
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
                                        <RecordTableActions record={account} onEdit={onEdit} onDelete={onDelete} />
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
    onDelete
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
}) {
    const listState = useRecordListState(contacts, filterContacts);

    return (
        <div className="slds-theme_default">
            <ListViewToolbar
                count={listState.filteredRecords.length}
                selectedCount={listState.selectedIds.size}
                searchId="contact-list-search"
                searchValue={listState.searchTerm}
                objectLabel="取引先責任者"
                onClearSelection={listState.clearSelection}
                onSearchChange={listState.setSearchTerm}
            />
            <RecordListEmptyStates
                loading={loading}
                hasRecords={listState.hasRecords}
                hasFilteredRecords={listState.hasFilteredRecords}
                connected={connected}
                loadingMessage="取引先責任者を読み込んでいます..."
                emptyMessage="取引先責任者が見つかりません。"
                disconnectedMessage="Salesforce に接続すると取引先責任者を読み込めます。"
                filteredEmptyMessage="検索条件に一致する取引先責任者が見つかりません。"
            />
            {!loading && listState.hasFilteredRecords ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">行番号</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <SelectionCheckbox
                                        ariaLabel="表示中の取引先責任者をすべて選択"
                                        checked={listState.selectionState.allVisibleSelected}
                                        mixed={listState.selectionState.someVisibleSelected}
                                        onChange={listState.toggleVisibleSelection}
                                    />
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
                            {listState.filteredRecords.map((contact, index) => (
                                <tr className="slds-hint-parent" key={contact.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <SelectionCheckbox
                                            ariaLabel={`${getContactName(contact)} を選択`}
                                            checked={listState.selectedIds.has(contact.Id)}
                                            mixed={false}
                                            onChange={() => listState.toggleSelection(contact.Id)}
                                        />
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
                                        <RecordTableActions record={contact} onEdit={onEdit} onDelete={onDelete} />
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

export function filterAccounts(accounts: Account[], searchTerm: string) {
    return filterRecords(accounts, searchTerm, (account) => [
        account.Name,
        account.Phone,
        account.Website,
        account.Industry,
        getAccountBilling(account)
    ]);
}

export function filterContacts(contacts: Contact[], searchTerm: string) {
    return filterRecords(contacts, searchTerm, (contact) => [
        getContactName(contact),
        contact.Title,
        contact.Account?.Name,
        contact.Email,
        contact.Phone
    ]);
}

export function getSelectionState<Record extends { Id: string }>(visibleRecords: Record[], selectedIds: Set<string>) {
    const visibleIds = visibleRecords.map((record) => record.Id);
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

    return {
        allVisibleSelected,
        someVisibleSelected: selectedVisibleCount > 0 && !allVisibleSelected,
        selectedVisibleCount
    };
}

function useRecordListState<Record extends { Id: string }>(
    records: Record[],
    filterListRecords: (records: Record[], searchTerm: string) => Record[]
) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const filteredRecords = useMemo(() => filterListRecords(records, searchTerm), [records, searchTerm, filterListRecords]);
    const selectionState = getSelectionState(filteredRecords, selectedIds);

    useEffect(() => {
        setSelectedIds((currentIds) => pruneSelection(currentIds, records.map((record) => record.Id)));
    }, [records]);

    return {
        searchTerm,
        setSearchTerm,
        selectedIds,
        selectionState,
        filteredRecords,
        hasRecords: records.length > 0,
        hasFilteredRecords: filteredRecords.length > 0,
        clearSelection: () => setSelectedIds(new Set()),
        toggleSelection: (recordId: string) => setSelectedIds((currentIds) => toggleSelectedId(currentIds, recordId)),
        toggleVisibleSelection: () =>
            setSelectedIds((currentIds) => toggleVisibleSelection(currentIds, filteredRecords.map((record) => record.Id)))
    };
}

function filterRecords<Record>(
    records: Record[],
    searchTerm: string,
    getSearchValues: (record: Record) => Array<string | undefined>
) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

    if (!normalizedSearchTerm) {
        return records;
    }

    return records.filter((record) =>
        getSearchValues(record).some((value) => normalizeSearchTerm(value).includes(normalizedSearchTerm))
    );
}

function RecordListEmptyStates({
    loading,
    hasRecords,
    hasFilteredRecords,
    connected,
    loadingMessage,
    emptyMessage,
    disconnectedMessage,
    filteredEmptyMessage
}: {
    loading: boolean;
    hasRecords: boolean;
    hasFilteredRecords: boolean;
    connected: boolean;
    loadingMessage: string;
    emptyMessage: string;
    disconnectedMessage: string;
    filteredEmptyMessage: string;
}) {
    if (loading) {
        return <EmptyState message={loadingMessage} />;
    }

    if (!hasRecords) {
        return <EmptyState message={connected ? emptyMessage : disconnectedMessage} />;
    }

    if (!hasFilteredRecords) {
        return <EmptyState message={filteredEmptyMessage} />;
    }

    return null;
}

function RecordTableActions<Record>({
    record,
    onEdit,
    onDelete
}: {
    record: Record;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    return (
        <div className="slds-button-group" role="group">
            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(record)}>
                編集
            </button>
            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(record)}>
                削除
            </button>
        </div>
    );
}

function normalizeSearchTerm(value?: string) {
    return (value || "").trim().toLocaleLowerCase();
}

function SelectionCheckbox({
    ariaLabel,
    checked,
    mixed,
    onChange
}: {
    ariaLabel: string;
    checked: boolean;
    mixed: boolean;
    onChange: () => void;
}) {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = mixed;
        }
    }, [mixed]);

    return (
        <label className="slds-checkbox">
            <input
                ref={checkboxRef}
                type="checkbox"
                aria-checked={mixed ? "mixed" : checked}
                aria-label={ariaLabel}
                checked={checked}
                onChange={onChange}
            />
            <span className="slds-checkbox_faux" />
        </label>
    );
}

function toggleSelectedId(selectedIds: Set<string>, id: string) {
    const nextIds = new Set(selectedIds);

    if (nextIds.has(id)) {
        nextIds.delete(id);
        return nextIds;
    }

    nextIds.add(id);
    return nextIds;
}

function toggleVisibleSelection(selectedIds: Set<string>, visibleIds: string[]) {
    const nextIds = new Set(selectedIds);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => nextIds.has(id));

    visibleIds.forEach((id) => {
        if (allVisibleSelected) {
            nextIds.delete(id);
            return;
        }

        nextIds.add(id);
    });

    return nextIds;
}

function pruneSelection(selectedIds: Set<string>, recordIds: string[]) {
    const availableIds = new Set(recordIds);
    const nextIds = new Set([...selectedIds].filter((id) => availableIds.has(id)));

    return nextIds.size === selectedIds.size ? selectedIds : nextIds;
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
