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
    onRestoreEmpty,
    onRefresh
}: {
    items: RecycleBinItem[];
    loading: boolean;
    onRestore: (items: RecycleBinItem[]) => void;
    onRestoreEmpty: () => void;
    onRefresh: () => void;
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

            <section className="slds-card slds-card_boundary playground-list-view">
                <RecycleBinToolbar
                    count={items.length}
                    onRefresh={onRefresh}
                />
                <div className="slds-card__body playground-list-view__body">
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
            </section>
        </>
    );
}
