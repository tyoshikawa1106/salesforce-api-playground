"use client";

import { RecordListEmptyStates } from "./RecordListEmptyStates";
import { RecordListTable } from "./RecordListTable";
import { getSelectedVisibleRecords, useRecordListState } from "./record-list-state";
import { UtilityIcon } from "../shell/SldsIcon";
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
    onBulkDelete,
    onBulkDeleteEmpty,
    onRefresh
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
    onBulkDeleteEmpty: () => void;
    onRefresh: () => void;
}) {
    const listState = useRecordListState(records, filterListRecords);
    const selectedVisibleRecords = getSelectedVisibleRecords(listState.filteredRecords, listState.selectedIds);

    function runBulkDelete() {
        if (selectedVisibleRecords.length === 0) {
            onBulkDeleteEmpty();
            return;
        }

        onBulkDelete(selectedVisibleRecords);
    }

    return (
        <section className="slds-card slds-card_boundary playground-list-view">
            <ListViewToolbar
                count={listState.filteredRecords.length}
                loading={loading}
                bulkDeleteLabel={bulkDeleteLabel}
                searchId={searchId}
                searchValue={listState.searchTerm}
                onBulkDelete={runBulkDelete}
                onRefresh={onRefresh}
                onSearchChange={listState.setSearchTerm}
            />
            <div className="slds-card__body playground-list-view__body">
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
        </section>
    );
}

function ListViewToolbar({
    count,
    loading,
    bulkDeleteLabel,
    searchId,
    searchValue,
    onBulkDelete,
    onRefresh,
    onSearchChange
}: {
    count: number;
    loading: boolean;
    bulkDeleteLabel: string;
    searchId: string;
    searchValue: string;
    onBulkDelete: () => void;
    onRefresh: () => void;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="slds-grid slds-wrap slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-view__toolbar">
            <div className="slds-col slds-align-bottom slds-p-vertical_xx-small">
                <p className="slds-text-body_small">
                    <span aria-live="polite" role="status">
                        {count} 個の項目
                    </span>
                </p>
            </div>
            <div className="slds-col slds-no-flex slds-grid slds-grid_vertical-align-center slds-wrap slds-p-vertical_xx-small playground-list-view__controls">
                <div className="slds-form-element playground-list-view__search">
                    <label className="slds-assistive-text" htmlFor={searchId}>
                        このリストを検索
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true">
                            <UtilityIcon className="slds-icon slds-icon-text-default slds-icon_xx-small" name="search" />
                        </span>
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
                <button
                    className="slds-button slds-button_icon slds-button_icon-more slds-m-left_xx-small"
                    type="button"
                    title="リストビューコントロール"
                    aria-label="リストビューコントロール"
                    disabled
                >
                    <UtilityIcon className="slds-button__icon" name="settings" />
                    <UtilityIcon className="slds-button__icon slds-button__icon_x-small slds-m-left_xx-small" name="down" />
                </button>
                <button
                    className="slds-button slds-button_icon slds-button_icon-more slds-m-left_xx-small"
                    type="button"
                    title="リスト表示を選択"
                    aria-label="リスト表示を選択"
                    disabled
                >
                    <UtilityIcon className="slds-button__icon" name="table" />
                    <UtilityIcon className="slds-button__icon slds-button__icon_x-small slds-m-left_xx-small" name="down" />
                </button>
                <button
                    className="slds-button slds-button_icon slds-button_icon-border-filled slds-m-left_x-small"
                    type="button"
                    title="更新"
                    aria-label="更新"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <UtilityIcon className="slds-button__icon" name="refresh" />
                </button>
                <button
                    className="slds-button slds-button_icon slds-button_icon-border-filled slds-m-left_xx-small"
                    type="button"
                    title={bulkDeleteLabel}
                    aria-label={bulkDeleteLabel}
                    onClick={onBulkDelete}
                    disabled={loading}
                >
                    <UtilityIcon className="slds-button__icon" name="delete" />
                </button>
            </div>
        </div>
    );
}
