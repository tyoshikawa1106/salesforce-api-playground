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
        <div className="playground-activity-toolbar">
            <div className="slds-text-align_right playground-activity-links">
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
