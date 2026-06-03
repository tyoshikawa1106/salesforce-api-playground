"use client";

import { RecordListEmptyStates } from "./RecordListEmptyStates";
import { RecordListTable } from "./RecordListTable";
import { useRecordListState } from "./record-list-state";
import type { RecordListColumn, RecordListMessages } from "./record-list-types";

export function RecordListPanel<Record extends { Id: string }>({
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
