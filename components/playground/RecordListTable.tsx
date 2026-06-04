"use client";

import { DataTableColumnHeader, DataTableHeader, RecordTableActions, SelectionCheckbox, TableCell } from "./RecordListTableParts";
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
