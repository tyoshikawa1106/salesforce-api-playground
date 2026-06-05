"use client";

import { formatDate } from "./formatting";
import {
    DataTable,
    DataTableColumnHeader,
    SelectionCell,
    SelectionHeaderCell,
    TableCell
} from "./RecordListTableParts";
import { StandardIcon, type StandardIconName } from "./SldsIcon";
import type { RecycleBinItem } from "./types";

export function RecycleBinToolbar({
    count
}: {
    count: number;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_small slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div>
                <div className="slds-text-title_bold">
                    {count} 件
                </div>
            </div>
            <div className="slds-grid slds-grid_vertical-align-center" aria-hidden="true">
                <span className="playground-recycle-bin-toolbar-spacer" />
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
        return <div className="slds-text-align_center slds-p-around_xx-large">ごみ箱を読み込んでいます...</div>;
    }

    if (!hasItems) {
        return <div className="slds-text-align_center slds-p-around_xx-large">ごみ箱に表示できる項目はありません。</div>;
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
                    <DataTableColumnHeader label="名前" />
                    <DataTableColumnHeader label="種別" />
                    <DataTableColumnHeader label="削除日時" />
                    <DataTableColumnHeader label="削除したユーザー" />
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={`${item.objectApiName}:${item.id}`} className="slds-hint-parent" aria-selected={selectedIds.has(item.id)}>
                        <SelectionCell
                            ariaLabel={`${item.objectLabel} ${item.name} を選択`}
                            checked={selectedIds.has(item.id)}
                            onChange={() => onToggleSelection(item.id)}
                            toggleOnCellClick
                        />
                        <th className="slds-cell_action-mode" scope="row" data-label="名前">
                            <div className="slds-truncate" title={item.name}>
                                {item.name}
                            </div>
                        </th>
                        <TableCell label="種別" value={<RecycleBinObjectType item={item} />} />
                        <TableCell label="削除日時" value={formatDate(item.deletedAt)} />
                        <TableCell label="削除したユーザー" value={item.deletedByName} />
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
            <span className="slds-truncate" title={item.objectLabel}>
                {item.objectLabel}
            </span>
            <span className={`slds-icon_container ${iconClass} slds-m-left_x-small`} title={item.objectLabel}>
                <StandardIcon className="slds-icon slds-icon_x-small" name={iconName} />
            </span>
        </span>
    );
}

function getRecycleBinObjectIconName(objectApiName: RecycleBinItem["objectApiName"]): StandardIconName {
    return objectApiName === "Account" ? "account" : "contact";
}
