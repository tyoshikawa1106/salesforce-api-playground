"use client";

import { type ReactNode, useState } from "react";

export function RecordMainTabs({
    relatedContent,
    detailContent
}: {
    relatedContent: ReactNode;
    detailContent: ReactNode;
}) {
    const [activeRecordTab, setActiveRecordTab] = useState<"related" | "details">("related");
    const relatedTabId = "record-related-tab";
    const relatedPanelId = "record-related-panel";
    const detailsTabId = "record-details-tab";
    const detailsPanelId = "record-details-panel";

    return (
        <div className="slds-tabs_default slds-tabs_card playground-record-tabs">
            <ul className="slds-tabs_default__nav slds-p-left_x-small" role="tablist">
                <li className={`slds-tabs_default__item ${activeRecordTab === "related" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link slds-button_reset"
                        type="button"
                        role="tab"
                        id={relatedTabId}
                        aria-selected={activeRecordTab === "related"}
                        aria-controls={relatedPanelId}
                        onClick={() => setActiveRecordTab("related")}
                    >
                        関連
                    </button>
                </li>
                <li className={`slds-tabs_default__item ${activeRecordTab === "details" ? "slds-is-active" : ""}`} role="presentation">
                    <button
                        className="slds-tabs_default__link slds-button_reset"
                        type="button"
                        role="tab"
                        id={detailsTabId}
                        aria-selected={activeRecordTab === "details"}
                        aria-controls={detailsPanelId}
                        onClick={() => setActiveRecordTab("details")}
                    >
                        詳細
                    </button>
                </li>
            </ul>
            <div
                className="slds-tabs_default__content slds-show slds-p-around_x-small"
                role="tabpanel"
                id={activeRecordTab === "related" ? relatedPanelId : detailsPanelId}
                aria-labelledby={activeRecordTab === "related" ? relatedTabId : detailsTabId}
            >
                {activeRecordTab === "related" ? relatedContent : detailContent}
            </div>
        </div>
    );
}
