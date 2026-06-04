"use client";

import { RecordListEmptyStates } from "./RecordListEmptyStates";
import { RecordListTable } from "./RecordListTable";
import { getSelectedVisibleRecords, useRecordListState } from "./record-list-state";
import type { RecordListColumn, RecordListMessages } from "./record-list-types";

export function RecordListPanel<Record extends { Id: string }>({
    records,
    loading,
    connected,
    searchId,
    ariaLabel,
    primaryColumnLabel,
    bulkDeleteLabel,
    selectAllLabel,
    messages,
    columns,
    filterListRecords,
    getRecordLabel,
    onOpen,
    onEdit,
    onDelete,
    onBulkDelete
}: {
    records: Record[];
    loading: boolean;
    connected: boolean;
    searchId: string;
    ariaLabel: string;
    primaryColumnLabel: string;
    bulkDeleteLabel: string;
    selectAllLabel: string;
    messages: RecordListMessages;
    columns: Array<RecordListColumn<Record>>;
    filterListRecords: (records: Record[], searchTerm: string) => Record[];
    getRecordLabel: (record: Record) => string;
    onOpen: (record: Record) => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
    onBulkDelete: (records: Record[]) => void;
}) {
    const listState = useRecordListState(records, filterListRecords);
    const selectedVisibleRecords = getSelectedVisibleRecords(listState.filteredRecords, listState.selectedIds);

    return (
        <div className="slds-theme_default">
            <ListViewToolbar
                count={listState.filteredRecords.length}
                selectedCount={selectedVisibleRecords.length}
                bulkDeleteLabel={bulkDeleteLabel}
                searchId={searchId}
                searchValue={listState.searchTerm}
                onBulkDelete={() => onBulkDelete(selectedVisibleRecords)}
                onClearSelection={listState.clearSelection}
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
                <RecordListTable
                    ariaLabel={ariaLabel}
                    columns={columns}
                    getRecordLabel={getRecordLabel}
                    listState={listState}
                    primaryColumnLabel={primaryColumnLabel}
                    selectAllLabel={selectAllLabel}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onOpen={onOpen}
                />
            ) : null}
        </div>
    );
}

function ListViewToolbar({
    count,
    selectedCount,
    bulkDeleteLabel,
    searchId,
    searchValue,
    onBulkDelete,
    onClearSelection,
    onSearchChange
}: {
    count: number;
    selectedCount: number;
    bulkDeleteLabel: string;
    searchId: string;
    searchValue: string;
    onBulkDelete: () => void;
    onClearSelection: () => void;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div className="slds-grid slds-grid_vertical-align-center slds-wrap">
                <div className="slds-text-title_bold">
                    {count} 件
                </div>
                {selectedCount > 0 ? (
                    <div className="slds-grid slds-grid_vertical-align-center slds-m-left_medium">
                        <span className="slds-text-body_small slds-m-right_small">
                            {selectedCount} 件を選択中
                        </span>
                        <button className="slds-button slds-button_neutral" type="button" onClick={onClearSelection}>
                            選択を解除
                        </button>
                        <button className="slds-button slds-button_destructive slds-m-left_x-small" type="button" onClick={onBulkDelete}>
                            {bulkDeleteLabel}
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
