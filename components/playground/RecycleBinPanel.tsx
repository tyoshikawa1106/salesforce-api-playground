"use client";

import { PageHeader, PageHeaderControl } from "./PageHeader";
import { RecycleBinEmptyState, RecycleBinTable, RecycleBinToolbar } from "./RecycleBinTable";
import { useListSelectionState } from "./record-list-state";
import type { RecycleBinItem } from "./types";

const getRecycleBinItemId = (item: RecycleBinItem) => item.id;

export function RecycleBinPanel({
    items,
    loading,
    onRestore,
    onRestoreEmpty
}: {
    items: RecycleBinItem[];
    loading: boolean;
    onRestore: (items: RecycleBinItem[]) => void;
    onRestoreEmpty: () => void;
}) {
    const {
        selectedIds,
        selectedVisibleRecords,
        selectionState,
        toggleSelection,
        toggleVisibleSelection
    } = useListSelectionState({
        availableRecords: items,
        visibleRecords: items,
        getRecordId: getRecycleBinItemId
    });

    function restoreSelectedItems() {
        if (selectedVisibleRecords.length === 0) {
            onRestoreEmpty();
            return;
        }

        onRestore(selectedVisibleRecords);
    }

    return (
        <>
            <PageHeader
                tab="recycleBin"
                eyebrow="ごみ箱"
                title="最近削除された項目"
                className="slds-page-header_object-home slds-page-header_joined"
                actions={
                    <>
                        <PageHeaderControl>
                            <button
                                className="slds-button slds-button_neutral"
                                type="button"
                                onClick={restoreSelectedItems}
                            >
                                復元
                            </button>
                        </PageHeaderControl>
                    </>
                }
            />

            <div className="slds-theme_default">
                <RecycleBinToolbar
                    count={items.length}
                />
                <RecycleBinEmptyState
                    loading={loading}
                    hasItems={items.length > 0}
                />
                {!loading && items.length > 0 ? (
                    <RecycleBinTable
                        items={items}
                        selectedIds={selectedIds}
                        allVisibleSelected={selectionState.allVisibleSelected}
                        someVisibleSelected={selectionState.someVisibleSelected}
                        onToggleSelection={toggleSelection}
                        onToggleVisibleSelection={toggleVisibleSelection}
                    />
                ) : null}
            </div>
        </>
    );
}
