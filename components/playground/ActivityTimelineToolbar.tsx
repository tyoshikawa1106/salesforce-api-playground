"use client";

export function ActivityTimelineToolbar({
    allSectionsExpanded,
    loading,
    sectionCount,
    onRefresh,
    onToggleAllSections
}: {
    allSectionsExpanded: boolean;
    loading: boolean;
    sectionCount: number;
    onRefresh: () => void;
    onToggleAllSections: () => void;
}) {
    return (
        <div className="slds-m-bottom_small">
            <div className="slds-grid slds-grid_align-end slds-grid_vertical-align-center slds-gutters_x-small">
                <button className="slds-button_reset slds-text-link" type="button" disabled={loading} onClick={() => void onRefresh()}>
                    更新
                </button>
                <span aria-hidden="true">・</span>
                <button
                    className="slds-button_reset slds-text-link"
                    type="button"
                    disabled={loading || sectionCount === 0}
                    onClick={onToggleAllSections}
                >
                    {allSectionsExpanded ? "すべて折りたたむ" : "すべて展開"}
                </button>
            </div>
        </div>
    );
}
