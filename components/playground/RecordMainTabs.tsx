"use client";

import { type ReactNode } from "react";

export function RecordMainTabs({
    detailContent
}: {
    detailContent: ReactNode;
}) {
    const detailsTabId = "record-details-tab";
    const detailsPanelId = "record-details-panel";

    return (
        <div className="slds-tabs_default slds-tabs_card playground-record-tabs">
            <ul className="slds-tabs_default__nav slds-p-left_x-small" role="tablist">
                <li className="slds-tabs_default__item slds-is-active" role="presentation">
                    <button
                        className="slds-tabs_default__link slds-button_reset"
                        type="button"
                        role="tab"
                        id={detailsTabId}
                        aria-selected="true"
                        aria-controls={detailsPanelId}
                    >
                        詳細
                    </button>
                </li>
            </ul>
            <div
                className="slds-tabs_default__content slds-show slds-p-around_x-small"
                role="tabpanel"
                id={detailsPanelId}
                aria-labelledby={detailsTabId}
            >
                {detailContent}
            </div>
        </div>
    );
}
