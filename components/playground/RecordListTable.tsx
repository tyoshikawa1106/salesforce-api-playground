"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { UtilityButtonIcon } from "./Navigation";
import type { RecordListColumn } from "./record-list-types";
import type { useRecordListState } from "./record-list-state";

type RecordListState<Record extends { Id: string }> = ReturnType<typeof useRecordListState<Record>>;

export function RecordListTable<Record extends { Id: string }>({
    ariaLabel,
    columns,
    getRecordLabel,
    listState,
    primaryColumnLabel,
    selectAllLabel,
    onOpen,
    onEdit,
    onDelete
}: {
    ariaLabel: string;
    columns: Array<RecordListColumn<Record>>;
    getRecordLabel: (record: Record) => string;
    listState: RecordListState<Record>;
    primaryColumnLabel: string;
    selectAllLabel: string;
    onOpen: (record: Record) => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    return (
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
    );
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
