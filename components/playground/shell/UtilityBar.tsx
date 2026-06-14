"use client";

import { useState } from "react";
import type { ComponentLogGroup } from "../component-logs";
import { StandardIcon, UtilityIcon, type UtilityIconName } from "./SldsIcon";

type UtilityBarItemId = "call" | "history" | "notes" | "logs";

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
    { id: "logs", icon: "table_code", label: "Logs", title: "Logs" }
];

export function UtilityBar({ componentLogGroups = [] }: { componentLogGroups?: ComponentLogGroup[] }) {
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
                        <li className="slds-utility-bar__item playground-utility-bar__item" key={item.id}>
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
                                    {item.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {activeItem ? (
                <div
                    className={`slds-utility-panel slds-grid slds-grid_vertical slds-is-open playground-utility-panel${activeItem.id === "logs" ? " playground-utility-panel_logs" : ""}`}
                    id={`utility-panel-${activeItem.id}`}
                    role="dialog"
                    aria-labelledby={panelHeadingId}
                >
                    <div className="slds-utility-panel__header slds-grid slds-shrink-none">
                        <div className="slds-media slds-media_center">
                            <div className="slds-media__figure slds-m-right_x-small">
                                <span className="slds-icon_container">
                                    {activeItem.id === "logs" ? (
                                        <UtilityIcon className="slds-icon slds-icon_small slds-icon-text-default" name="table_code" />
                                    ) : (
                                        <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name={activeItem.id === "call" ? "logACall" : "task"} />
                                    )}
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
                        {activeItem.id === "logs" ? (
                            <ComponentLogsPanel groups={componentLogGroups} />
                        ) : (
                            <div className="slds-align_absolute-center">Utility Panel Body</div>
                        )}
                    </div>
                </div>
            ) : null}
        </footer>
    );
}

function ComponentLogsPanel({ groups }: { groups: ComponentLogGroup[] }) {
    if (groups.length === 0) {
        return (
            <div className="slds-p-around_medium slds-text-color_weak">
                表示中のコンポーネントはありません。
            </div>
        );
    }

    return (
        <div className="slds-p-around_small playground-component-logs">
            <div className="slds-m-bottom_medium playground-component-logs__self">
                <span className="slds-text-title_bold">ComponentLogsPanel</span>
            </div>
            {groups.map((group) => (
                <section className="slds-m-bottom_medium" key={group.label}>
                    <h3 className="slds-text-title_caps slds-m-bottom_x-small">{group.label}</h3>
                    <ul className="slds-has-dividers_bottom-space">
                        {group.entries.map((entry) => (
                            <li className="slds-item playground-component-logs__item" key={`${group.label}-${entry.name}-${entry.filePath}`}>
                                <span className="slds-text-title_bold">{entry.name}</span>
                                <span className="playground-component-logs__description">{entry.description}</span>
                                <code className="playground-component-logs__path">{entry.filePath}</code>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
