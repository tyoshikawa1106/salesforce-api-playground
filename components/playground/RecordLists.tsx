"use client";

import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { UtilityButtonIcon } from "./Navigation";

type RecordListColumn<Record> = {
    label: string;
    getValue: (record: Record) => ReactNode;
};

type RecordListMessages = {
    loading: string;
    empty: string;
    disconnected: string;
    filteredEmpty: string;
};

function ListViewToolbar({
    count,
    searchId,
    searchValue,
    onSearchChange
}: {
    count: number;
    searchId: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div>
                <div className="slds-text-title_bold">
                    {count} 件
                </div>
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
    const columns: Array<RecordListColumn<Account>> = [
        { label: "電話", getValue: (account) => account.Phone },
        { label: "Web サイト", getValue: (account) => account.Website },
        { label: "業種", getValue: (account) => account.Industry },
        { label: "請求先", getValue: getAccountBilling },
        { label: "最終更新日", getValue: (account) => formatDate(account.LastModifiedDate) }
    ];

    return (
        <RecordListPanel
            records={accounts}
            loading={loading}
            connected={connected}
            searchId="account-list-search"
            ariaLabel="取引先一覧"
            primaryColumnLabel="取引先名"
            selectAllLabel="表示中の取引先をすべて選択"
            messages={{
                loading: "取引先を読み込んでいます...",
                empty: "取引先が見つかりません。",
                disconnected: "Salesforce に接続すると取引先を読み込めます。",
                filteredEmpty: "検索条件に一致する取引先が見つかりません。"
            }}
            columns={columns}
            filterListRecords={filterAccounts}
            getRecordLabel={(account) => account.Name}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
        />
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
    const columns: Array<RecordListColumn<Contact>> = [
        { label: "役職", getValue: (contact) => contact.Title },
        { label: "取引先名", getValue: (contact) => contact.Account?.Name },
        { label: "メール", getValue: (contact) => contact.Email },
        { label: "電話", getValue: (contact) => contact.Phone },
        { label: "最終更新日", getValue: (contact) => formatDate(contact.LastModifiedDate) }
    ];

    return (
        <RecordListPanel
            records={contacts}
            loading={loading}
            connected={connected}
            searchId="contact-list-search"
            ariaLabel="取引先責任者一覧"
            primaryColumnLabel="氏名"
            selectAllLabel="表示中の取引先責任者をすべて選択"
            messages={{
                loading: "取引先責任者を読み込んでいます...",
                empty: "取引先責任者が見つかりません。",
                disconnected: "Salesforce に接続すると取引先責任者を読み込めます。",
                filteredEmpty: "検索条件に一致する取引先責任者が見つかりません。"
            }}
            columns={columns}
            filterListRecords={filterContacts}
            getRecordLabel={getContactName}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
}

function RecordListPanel<Record extends { Id: string }>({
    records,
    loading,
    connected,
    searchId,
    ariaLabel,
    primaryColumnLabel,
    selectAllLabel,
    messages,
    columns,
    filterListRecords,
    getRecordLabel,
    onOpen,
    onEdit,
    onDelete
}: {
    records: Record[];
    loading: boolean;
    connected: boolean;
    searchId: string;
    ariaLabel: string;
    primaryColumnLabel: string;
    selectAllLabel: string;
    messages: RecordListMessages;
    columns: Array<RecordListColumn<Record>>;
    filterListRecords: (records: Record[], searchTerm: string) => Record[];
    getRecordLabel: (record: Record) => string;
    onOpen: (record: Record) => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    const listState = useRecordListState(records, filterListRecords);

    return (
        <div className="slds-theme_default">
            <ListViewToolbar
                count={listState.filteredRecords.length}
                searchId={searchId}
                searchValue={listState.searchTerm}
                onSearchChange={listState.setSearchTerm}
            />
            <RecordListEmptyStates
                loading={loading}
                hasRecords={listState.hasRecords}
                hasFilteredRecords={listState.hasFilteredRecords}
                connected={connected}
                loadingMessage={messages.loading}
                emptyMessage={messages.empty}
                disconnectedMessage={messages.disconnected}
                filteredEmptyMessage={messages.filteredEmpty}
            />
            {!loading && listState.hasFilteredRecords ? (
                <div className="slds-scrollable_x">
                    <table
                        className="slds-table slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols"
                        role="grid"
                        aria-label={ariaLabel}
                        aria-multiselectable="true"
                    >
                        <thead>
                            <tr className="slds-line-height_reset">
                                <th className="slds-text-align_right slds-cell_action-mode" role="cell" style={{ width: "3.25rem" }}>
                                    <div className="slds-th__action slds-th__action_form">
                                        <SelectionCheckbox
                                            ariaLabel={selectAllLabel}
                                            checked={listState.selectionState.allVisibleSelected}
                                            mixed={listState.selectionState.someVisibleSelected}
                                            onChange={listState.toggleVisibleSelection}
                                        />
                                    </div>
                                </th>
                                <DataTableColumnHeader label={primaryColumnLabel} />
                                {columns.map((column) => (
                                    <DataTableColumnHeader key={column.label} label={column.label} />
                                ))}
                                <th className="slds-cell_action-mode" scope="col" style={{ width: "3.25rem" }}>
                                    <DataTableHeader label="アクション" assistive />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {listState.filteredRecords.map((record) => {
                                const recordLabel = getRecordLabel(record);

                                return (
                                    <tr
                                        className="slds-hint-parent"
                                        key={record.Id}
                                        aria-selected={listState.selectedIds.has(record.Id)}
                                    >
                                        <td className="slds-text-align_right slds-cell_action-mode" data-label="選択" role="gridcell">
                                            <SelectionCheckbox
                                                ariaLabel={`${recordLabel} を選択`}
                                                checked={listState.selectedIds.has(record.Id)}
                                                mixed={false}
                                                onChange={() => listState.toggleSelection(record.Id)}
                                            />
                                        </td>
                                        <th className="slds-cell_action-mode" scope="row" data-label={primaryColumnLabel}>
                                            <div className="slds-truncate" title={recordLabel}>
                                                <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(record)}>
                                                    {recordLabel}
                                                </button>
                                            </div>
                                        </th>
                                        {columns.map((column) => (
                                            <TableCell key={column.label} label={column.label} value={column.getValue(record)} />
                                        ))}
                                        <td className="slds-cell_action-mode slds-text-align_center" data-label="アクション" role="gridcell">
                                            <RecordTableActions
                                                record={record}
                                                recordLabel={recordLabel}
                                                open={listState.openActionRecordId === record.Id}
                                                onToggle={() => listState.toggleActionMenu(record.Id)}
                                                onClose={listState.closeActionMenu}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
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
    const [openActionRecordId, setOpenActionRecordId] = useState<string | null>(null);
    const filteredRecords = useMemo(() => filterListRecords(records, searchTerm), [records, searchTerm, filterListRecords]);
    const selectionState = getSelectionState(filteredRecords, selectedIds);

    useEffect(() => {
        setSelectedIds((currentIds) => pruneSelection(currentIds, records.map((record) => record.Id)));
    }, [records]);

    return {
        searchTerm,
        setSearchTerm: (nextSearchTerm: string) => {
            setSearchTerm(nextSearchTerm);
            setSelectedIds(new Set());
            setOpenActionRecordId(null);
        },
        selectedIds,
        selectionState,
        filteredRecords,
        openActionRecordId,
        hasRecords: records.length > 0,
        hasFilteredRecords: filteredRecords.length > 0,
        toggleSelection: (recordId: string) => setSelectedIds((currentIds) => toggleSelectedId(currentIds, recordId)),
        closeActionMenu: () => setOpenActionRecordId(null),
        toggleActionMenu: (recordId: string) =>
            setOpenActionRecordId((currentRecordId) => (currentRecordId === recordId ? null : recordId)),
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
    recordLabel,
    open,
    onToggle,
    onClose,
    onEdit,
    onDelete
}: {
    record: Record;
    recordLabel: string;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    const menuId = useId();
    const menuLabel = `${recordLabel} の操作`;

    function runMenuAction(action: (record: Record) => void) {
        onClose();
        action(record);
    }

    return (
        <div className={`slds-dropdown-trigger slds-dropdown-trigger_click${open ? " slds-is-open" : ""}`}>
            <button
                className="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small"
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={menuId}
                title={menuLabel}
                onClick={onToggle}
            >
                <UtilityButtonIcon name="down" label="" />
                <span className="slds-assistive-text">{menuLabel}</span>
            </button>
            <div className="slds-dropdown slds-dropdown_right" id={menuId}>
                <ul className="slds-dropdown__list" role="menu" aria-label={menuLabel}>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={open ? 0 : -1}
                            onClick={(event) => {
                                event.preventDefault();
                                runMenuAction(onEdit);
                            }}
                        >
                            <span title="編集">編集</span>
                        </a>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={-1}
                            onClick={(event) => {
                                event.preventDefault();
                                runMenuAction(onDelete);
                            }}
                        >
                            <span title="削除">削除</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function DataTableColumnHeader({ label }: { label: string }) {
    return (
        <th className="slds-is-resizable slds-cell_action-mode" scope="col">
            <DataTableHeader label={label} />
        </th>
    );
}

function DataTableHeader({ label, assistive = false }: { label: string; assistive?: boolean }) {
    return (
        <div className="slds-th__action">
            <span className={assistive ? "slds-assistive-text" : "slds-truncate"} title={label}>
                {label}
            </span>
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
    const checkboxId = useId();

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = mixed;
        }
    }, [mixed]);

    return (
        <div className="slds-checkbox">
            <input
                id={checkboxId}
                ref={checkboxRef}
                type="checkbox"
                aria-checked={mixed ? "mixed" : checked}
                aria-label={ariaLabel}
                checked={checked}
                onChange={onChange}
            />
            <label className="slds-checkbox__label" htmlFor={checkboxId} aria-hidden="true">
                <span className="slds-checkbox_faux" />
                <span className="slds-form-element__label slds-assistive-text">{ariaLabel}</span>
            </label>
        </div>
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

function TableCell({ label, value }: { label: string; value?: ReactNode }) {
    const displayValue = value || "-";
    const title = typeof displayValue === "string" ? displayValue : undefined;

    return (
        <td className="slds-cell_action-mode" data-label={label} role="gridcell">
            <div className="slds-truncate" title={title}>
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
