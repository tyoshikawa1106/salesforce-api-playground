"use client";

import { useMemo, useState } from "react";
import { formatDate } from "./formatting";
import { PageHeader, PageHeaderControl, RefreshButton } from "./ObjectHome";
import { SelectionCheckbox } from "./RecordListTableParts";
import { filterRecords } from "./record-list-state";
import { UtilityIcon } from "./SldsIcon";
import type { RecycleBinItem } from "./types";

export function RecycleBinPanel({
    items,
    loading,
    onRefresh,
    onRestore,
    onRestoreEmpty
}: {
    items: RecycleBinItem[];
    loading: boolean;
    onRefresh: () => void;
    onRestore: (items: RecycleBinItem[]) => void;
    onRestoreEmpty: () => void;
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const filteredItems = useMemo(
        () => filterRecords(items, searchTerm, (item) => [item.objectLabel, item.name, item.deletedAt, item.displayText]),
        [items, searchTerm]
    );
    const selectedVisibleCount = filteredItems.filter((item) => selectedIds.has(item.id)).length;
    const allVisibleSelected = filteredItems.length > 0 && selectedVisibleCount === filteredItems.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
    const selectedVisibleItems = filteredItems.filter((item) => selectedIds.has(item.id));

    function toggleSelection(id: string) {
        setSelectedIds((currentIds) => {
            const nextIds = new Set(currentIds);
            if (nextIds.has(id)) {
                nextIds.delete(id);
                return nextIds;
            }

            nextIds.add(id);
            return nextIds;
        });
    }

    function toggleVisibleSelection() {
        setSelectedIds((currentIds) => {
            const nextIds = new Set(currentIds);
            const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => nextIds.has(item.id));

            filteredItems.forEach((item) => {
                if (allVisibleSelected) {
                    nextIds.delete(item.id);
                    return;
                }

                nextIds.add(item.id);
            });

            return nextIds;
        });
    }

    function restoreSelectedItems() {
        if (selectedVisibleItems.length === 0) {
            onRestoreEmpty();
            return;
        }

        onRestore(selectedVisibleItems);
        setSelectedIds(new Set());
    }

    return (
        <>
            <PageHeader
                tab="recycleBin"
                eyebrow="ごみ箱"
                title="最近削除された項目"
                actions={
                    <PageHeaderControl>
                        <RefreshButton loading={loading} onRefresh={onRefresh} />
                    </PageHeaderControl>
                }
            />

            <div className="slds-theme_default">
                <RecycleBinToolbar
                    count={filteredItems.length}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    onRestore={restoreSelectedItems}
                />
                <RecycleBinEmptyState
                    loading={loading}
                    hasItems={items.length > 0}
                    hasFilteredItems={filteredItems.length > 0}
                />
                {!loading && filteredItems.length > 0 ? (
                    <RecycleBinTable
                        items={filteredItems}
                        selectedIds={selectedIds}
                        allVisibleSelected={allVisibleSelected}
                        someVisibleSelected={someVisibleSelected}
                        onToggleSelection={toggleSelection}
                        onToggleVisibleSelection={toggleVisibleSelection}
                    />
                ) : null}
            </div>
        </>
    );
}

function RecycleBinToolbar({
    count,
    searchValue,
    onSearchChange,
    onRestore
}: {
    count: number;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onRestore: () => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div className="slds-text-title_bold">
                {count} 件
            </div>
            <div className="slds-grid slds-grid_vertical-align-center">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor="recycle-bin-search">
                        このリストを検索
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true" />
                        <input
                            id="recycle-bin-search"
                            className="slds-input slds-max-medium-size_full playground-list-search"
                            type="search"
                            value={searchValue}
                            placeholder="このリストを検索..."
                            onChange={(event) => onSearchChange(event.target.value)}
                        />
                    </div>
                </div>
                <button
                    className="slds-button slds-button_icon slds-button_icon-border-filled slds-m-left_x-small"
                    type="button"
                    title="選択した項目を復元"
                    aria-label="選択した項目を復元"
                    onClick={onRestore}
                >
                    <UtilityIcon className="slds-button__icon" name="refresh" />
                </button>
            </div>
        </div>
    );
}

function RecycleBinEmptyState({
    loading,
    hasItems,
    hasFilteredItems
}: {
    loading: boolean;
    hasItems: boolean;
    hasFilteredItems: boolean;
}) {
    if (loading) {
        return <div className="slds-text-align_center slds-p-around_xx-large">ごみ箱を読み込んでいます...</div>;
    }

    if (!hasItems) {
        return <div className="slds-text-align_center slds-p-around_xx-large">ごみ箱に表示できる項目はありません。</div>;
    }

    if (!hasFilteredItems) {
        return <div className="slds-text-align_center slds-p-around_xx-large">検索条件に一致する項目が見つかりません。</div>;
    }

    return null;
}

function RecycleBinTable({
    items,
    selectedIds,
    allVisibleSelected,
    someVisibleSelected,
    onToggleSelection,
    onToggleVisibleSelection
}: {
    items: RecycleBinItem[];
    selectedIds: Set<string>;
    allVisibleSelected: boolean;
    someVisibleSelected: boolean;
    onToggleSelection: (id: string) => void;
    onToggleVisibleSelection: () => void;
}) {
    return (
        <div className="slds-scrollable_x">
            <table className="slds-table slds-table_bordered slds-table_fixed-layout" role="grid" aria-label="ごみ箱の項目一覧" aria-multiselectable="true">
                <thead>
                    <tr className="slds-line-height_reset">
                        <th className="slds-text-align_right slds-cell_action-mode" role="cell" style={{ width: "3.25rem" }}>
                            <div className="slds-th__action slds-th__action_form">
                                <SelectionCheckbox
                                    ariaLabel="表示中の項目をすべて選択"
                                    checked={allVisibleSelected}
                                    mixed={someVisibleSelected}
                                    onChange={onToggleVisibleSelection}
                                />
                            </div>
                        </th>
                        <RecycleBinHeader label="種別" />
                        <RecycleBinHeader label="名前" />
                        <RecycleBinHeader label="削除日時" />
                        <RecycleBinHeader label="補足" />
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={`${item.objectApiName}:${item.id}`} className="slds-hint-parent" aria-selected={selectedIds.has(item.id)}>
                            <td className="slds-text-align_right slds-cell_action-mode" data-label="選択" role="gridcell">
                                <SelectionCheckbox
                                    ariaLabel={`${item.objectLabel} ${item.name} を選択`}
                                    checked={selectedIds.has(item.id)}
                                    mixed={false}
                                    onChange={() => onToggleSelection(item.id)}
                                />
                            </td>
                            <RecycleBinCell label="種別" value={item.objectLabel} />
                            <RecycleBinCell label="名前" value={item.name} />
                            <RecycleBinCell label="削除日時" value={formatDate(item.deletedAt)} />
                            <RecycleBinCell label="補足" value={item.displayText || "-"} />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RecycleBinHeader({ label }: { label: string }) {
    return (
        <th className="slds-is-resizable slds-cell_action-mode" scope="col">
            <div className="slds-th__action">
                <span className="slds-truncate" title={label}>{label}</span>
            </div>
        </th>
    );
}

function RecycleBinCell({ label, value }: { label: string; value: string }) {
    return (
        <td className="slds-cell_action-mode" data-label={label} role="gridcell">
            <div className="slds-truncate" title={value}>
                {value}
            </div>
        </td>
    );
}
