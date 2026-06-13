"use client";

import { useState } from "react";
import { StandardIcon, UtilityIcon, type UtilityIconName } from "./SldsIcon";

type UtilityBarItemId = "call" | "history" | "notes" | "omni";

type UtilityBarItem = {
    id: UtilityBarItemId;
    icon: UtilityIconName;
    label: string;
    title: string;
};

const utilityItems: UtilityBarItem[] = [
    { id: "call", icon: "call", label: "Call", title: "Call" },
    { id: "history", icon: "clock", label: "History", title: "History" },
    { id: "notes", icon: "note", label: "Notes", title: "Notes" },
    { id: "omni", icon: "omni_channel", label: "Omni-Channel", title: "Online" }
];

export function UtilityBar() {
    const [activeItemId, setActiveItemId] = useState<UtilityBarItemId | null>(null);
    const activeItem = utilityItems.find((item) => item.id === activeItemId);
    const panelHeadingId = activeItem ? `utility-panel-heading-${activeItem.id}` : undefined;

    return (
        <footer className="slds-utility-bar_container playground-utility-bar" aria-label="Utility Bar">
            <h2 className="slds-assistive-text">Utility Bar</h2>
            <ul className="slds-utility-bar playground-utility-bar__list">
                {utilityItems.map((item) => {
                    const active = activeItemId === item.id;

                    return (
                        <li className="slds-utility-bar__item" key={item.id}>
                            <button
                                className={`slds-button slds-utility-bar__action${active ? " slds-is-active" : ""}`}
                                type="button"
                                aria-controls={`utility-panel-${item.id}`}
                                aria-expanded={active}
                                aria-pressed={active}
                                onClick={() => setActiveItemId(active ? null : item.id)}
                            >
                                <UtilityIcon className="slds-button__icon slds-button__icon_left" name={item.icon} />
                                <span className="slds-utility-bar__text">
                                    {item.id === "omni" ? (
                                        <>
                                            <span className="slds-m-bottom_xxx-small">{item.title}</span>
                                            <span>{item.label}</span>
                                        </>
                                    ) : item.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {activeItem ? (
                <div
                    className="slds-utility-panel slds-grid slds-grid_vertical slds-is-open playground-utility-panel"
                    id={`utility-panel-${activeItem.id}`}
                    role="dialog"
                    aria-labelledby={panelHeadingId}
                >
                    <div className="slds-utility-panel__header slds-grid slds-shrink-none">
                        <div className="slds-media slds-media_center">
                            <div className="slds-media__figure slds-m-right_x-small">
                                <span className="slds-icon_container">
                                    <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name={activeItem.id === "call" ? "logACall" : "task"} />
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <h2 id={panelHeadingId}>{activeItem.label}</h2>
                            </div>
                        </div>
                        <div className="slds-col_bump-left slds-shrink-none">
                            <button className="slds-button slds-button_icon" type="button" title="Close Panel" onClick={() => setActiveItemId(null)}>
                                <UtilityIcon className="slds-button__icon" name="minimize_window" />
                                <span className="slds-assistive-text">Close Panel</span>
                            </button>
                        </div>
                    </div>
                    <div className="slds-utility-panel__body">
                        <div className="slds-align_absolute-center">Utility Panel Body</div>
                    </div>
                </div>
            ) : null}
        </footer>
    );
}
