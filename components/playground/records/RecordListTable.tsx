"use client";

import type { MouseEvent } from "react";
import {
    DataTable,
    DataTableColumnHeader,
    DataTableHeader,
    RecordTableActions,
    SelectionCell,
    SelectionHeaderCell,
    TableCell
} from "./RecordListTableParts";
import type { RecordListColumn } from "./record-list-types";
import type { useRecordListState } from "./record-list-state";

type RecordListState<Record extends { Id: string }> = ReturnType<typeof useRecordListState<Record>>;

export function RecordListTable<Record extends { Id: string }>({
    ariaLabel,
    columns,
    getRecordLabel,
    getRecordPath,
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
    getRecordPath: (record: Record) => string;
    listState: RecordListState<Record>;
    primaryColumnLabel: string;
    selectAllLabel: string;
    onOpen: (record: Record) => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    return (
        <DataTable ariaLabel={ariaLabel}>
            <thead>
                <tr className="slds-line-height_reset">
                    <SelectionHeaderCell
                        ariaLabel={selectAllLabel}
                        checked={listState.selectionState.allVisibleSelected}
                        mixed={listState.selectionState.someVisibleSelected}
                        onChange={listState.toggleVisibleSelection}
                    />
                    <DataTableColumnHeader label={primaryColumnLabel} />
                    {columns.map((column) => {
                        const columnClassName = column.hideOnMobile ? "playground-record-table__cell_mobile-hidden" : "";

                        return (
                            <DataTableColumnHeader key={column.label} className={columnClassName} label={column.label} />
                        );
                    })}
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
                            <SelectionCell
                                ariaLabel={`${recordLabel} を選択`}
                                checked={listState.selectedIds.has(record.Id)}
                                onChange={() => listState.toggleSelection(record.Id)}
                            />
                            <th className="slds-cell_action-mode" scope="row" data-label={primaryColumnLabel}>
                                <div className="slds-truncate" title={recordLabel}>
                                    <a
                                        className="slds-text-link"
                                        href={getRecordPath(record)}
                                        onClick={(event) => {
                                            if (!shouldHandleRecordLinkClick(event)) {
                                                return;
                                            }
                                            event.preventDefault();
                                            onOpen(record);
                                        }}
                                    >
                                        {recordLabel}
                                    </a>
                                </div>
                            </th>
                            {columns.map((column) => {
                                const columnClassName = column.hideOnMobile ? "playground-record-table__cell_mobile-hidden" : "";

                                return (
                                    <TableCell key={column.label} className={columnClassName} label={column.label} value={column.getValue(record)} />
                                );
                            })}
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
        </DataTable>
    );
}

function shouldHandleRecordLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    return !event.defaultPrevented
        && event.button === 0
        && !event.metaKey
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && (!event.currentTarget.target || event.currentTarget.target === "_self");
}
