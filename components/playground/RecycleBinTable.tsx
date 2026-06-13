"use client";

import { formatDate } from "./formatting";
import {
    DataTable,
    DataTableColumnHeader,
    SelectionCell,
    SelectionHeaderCell,
    TableCell
} from "./RecordListTableParts";
import { StandardIcon, UtilityIcon, type StandardIconName } from "./SldsIcon";
import type { RecycleBinItem } from "./types";

export function RecycleBinToolbar({
    count,
    onRefresh
}: {
    count: number;
    onRefresh: () => void;
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
            <div className="slds-col slds-no-flex slds-grid slds-grid_vertical-align-center slds-p-vertical_xx-small playground-list-view__controls">
                <button
                    className="slds-button slds-button_icon slds-button_icon-border-filled"
                    type="button"
                    title="更新"
                    aria-label="更新"
                    onClick={onRefresh}
                >
                    <UtilityIcon className="slds-button__icon" name="refresh" />
                </button>
            </div>
        </div>
    );
}

export function RecycleBinEmptyState({
    loading,
    hasItems
}: {
    loading: boolean;
    hasItems: boolean;
}) {
    if (loading) {
        return (
            <div className="slds-text-align_center slds-is-relative playground-list-view__empty">
                <div className="slds-spinner slds-spinner_small slds-spinner_brand" role="status">
                    <span className="slds-assistive-text">ごみ箱を読み込んでいます...</span>
                    <div className="slds-spinner__dot-a" />
                    <div className="slds-spinner__dot-b" />
                </div>
            </div>
        );
    }

    if (!hasItems) {
        return <div className="slds-text-align_center playground-list-view__empty">ごみ箱に表示できる項目はありません。</div>;
    }

    return null;
}

export function RecycleBinTable({
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
    const sortedItems = [...items].sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));

    return (
        <DataTable ariaLabel="ごみ箱の項目一覧">
            <thead>
                <tr className="slds-line-height_reset">
                    <SelectionHeaderCell
                        ariaLabel="表示中の項目をすべて選択"
                        checked={allVisibleSelected}
                        mixed={someVisibleSelected}
                        onChange={onToggleVisibleSelection}
                    />
                    <DataTableColumnHeader label="削除日時" />
                    <DataTableColumnHeader label="削除したユーザー" />
                    <DataTableColumnHeader label="種別" />
                    <DataTableColumnHeader label="レコード名" />
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item) => (
                    <tr key={`${item.objectApiName}:${item.id}`} className="slds-hint-parent" aria-selected={selectedIds.has(item.id)}>
                        <SelectionCell
                            ariaLabel={`${item.objectLabel} ${item.name} を選択`}
                            checked={selectedIds.has(item.id)}
                            onChange={() => onToggleSelection(item.id)}
                            toggleOnCellClick
                        />
                        <TableCell label="削除日時" value={formatDate(item.deletedAt)} />
                        <TableCell label="削除したユーザー" value={item.deletedByName} />
                        <TableCell label="種別" value={<RecycleBinObjectType item={item} />} />
                        <th className="slds-cell_action-mode" scope="row" data-label="レコード名">
                            <div className="slds-truncate" title={item.name}>
                                {item.name}
                            </div>
                        </th>
                    </tr>
                ))}
            </tbody>
        </DataTable>
    );
}

function RecycleBinObjectType({ item }: { item: RecycleBinItem }) {
    const iconName = getRecycleBinObjectIconName(item.objectApiName);
    const iconClass = item.objectApiName === "Account" ? "slds-icon-standard-account" : "slds-icon-standard-contact";

    return (
        <span className="slds-grid slds-grid_vertical-align-center slds-truncate">
            <span className={`slds-icon_container ${iconClass} slds-m-right_x-small`} title={item.objectLabel}>
                <StandardIcon className="slds-icon slds-icon_x-small" name={iconName} />
            </span>
            <span className="slds-truncate" title={item.objectLabel}>
                {item.objectLabel}
            </span>
        </span>
    );
}

function getRecycleBinObjectIconName(objectApiName: RecycleBinItem["objectApiName"]): StandardIconName {
    return objectApiName === "Account" ? "account" : "contact";
}
