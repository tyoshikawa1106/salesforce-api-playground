"use client";

import type { CSSProperties } from "react";
import { StandardIcon, type StandardIconName, UtilityIcon } from "./SldsIcon";

type ActivityComposerAction = {
    iconClassName: string;
    iconName: StandardIconName;
    iconStyle?: CSSProperties;
    label: string;
    onClick: () => void;
    value: string;
};

export function ActivityComposerBar({
    onOpenCall,
    onOpenEvent,
    onOpenTask
}: {
    onOpenCall: () => void;
    onOpenEvent: () => void;
    onOpenTask: () => void;
}) {
    const taskIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(59, 167, 85))"
    } as CSSProperties;
    const eventIconStyle = {
        "--sds-c-icon-color-background": "var(--slds-c-icon-color-background, rgb(235, 112, 146))"
    } as CSSProperties;
    const actions: ActivityComposerAction[] = [
        { iconClassName: "slds-icon-standard-log-a-call", iconName: "logACall", label: "電話を記録", onClick: onOpenCall, value: "LogCall" },
        { iconClassName: "slds-icon-standard-task", iconName: "task", iconStyle: taskIconStyle, label: "新規ToDo", onClick: onOpenTask, value: "NewTask" },
        { iconClassName: "slds-icon-standard-event", iconName: "event", iconStyle: eventIconStyle, label: "新規行動", onClick: onOpenEvent, value: "NewEvent" }
    ];

    return (
        <ul className="slds-button-group-row playground-activity-composer-bar" aria-label="活動作成">
            {actions.map((action) => (
                <li className="slds-button-group-item" key={action.value}>
                    <div className="slds-button-group fix_button-group-flexbox" role="group" aria-label={action.label} part="button-group">
                        <button className="slds-button slds-button_neutral playground-activity-composer-action" type="button" aria-label={action.label} title={action.label} value={action.value} onClick={action.onClick}>
                            <span className={`${action.iconClassName} slds-icon_container playground-activity-composer-action__icon`} title={action.label}>
                                <span className="playground-activity-composer-action__icon-boundary" style={action.iconStyle}>
                                    <StandardIcon className="slds-icon slds-icon_small" name={action.iconName} />
                                </span>
                                <span className="slds-assistive-text">{action.label}</span>
                            </span>
                            <span className="hidden playground-activity-composer-action__label" aria-hidden="true">{action.label}</span>
                        </button>
                        <button
                            className="slds-button slds-button_icon-border-filled fix-slds-button_icon-border-filled slds-button_last playground-activity-composer-action__menu"
                            type="button"
                            aria-expanded="false"
                            aria-haspopup="true"
                            title={`追加の ${action.label} アクションはありません`}
                            disabled
                        >
                            <UtilityIcon className="slds-button__icon" name="down" />
                            <span className="slds-assistive-text">追加の {action.label} アクションはありません</span>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
