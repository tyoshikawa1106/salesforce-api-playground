"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { StandardIcon, type StandardIconName, UtilityIcon } from "../shell/SldsIcon";

const mobileModalMediaQuery = "(max-width: 767px), (pointer: coarse)";

function useActivityComposerMobileModal() {
    const [mobileModal, setMobileModal] = useState(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(mobileModalMediaQuery);

        function syncMobileModal() {
            setMobileModal(mediaQueryList.matches);
        }

        syncMobileModal();
        mediaQueryList.addEventListener("change", syncMobileModal);

        return () => {
            mediaQueryList.removeEventListener("change", syncMobileModal);
        };
    }, []);

    return mobileModal;
}

export function ActivityDockedComposerFrame({
    bodyId,
    children,
    expanded,
    iconName,
    minimized,
    saving,
    title,
    titleId,
    onCancel,
    onSubmit,
    onToggleExpanded,
    onToggleMinimized
}: {
    bodyId: string;
    children: ReactNode;
    expanded: boolean;
    iconName: StandardIconName;
    minimized: boolean;
    saving: boolean;
    title: string;
    titleId: string;
    onCancel: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onToggleExpanded: () => void;
    onToggleMinimized: () => void;
}) {
    const mobileModal = useActivityComposerMobileModal();
    const renderAsModal = expanded || mobileModal;
    const effectiveMinimized = mobileModal ? false : minimized;
    const composerStateClass = effectiveMinimized ? "slds-is-closed" : "slds-is-open";
    const minimizeTitle = effectiveMinimized ? "復元" : "最小化";
    const expandTitle = expanded ? "復元" : "最大化";
    const composer = (
        <form
            className={`slds-docked-composer slds-grid slds-grid_vertical ${composerStateClass} playground-task-composer ${
                renderAsModal ? "playground-task-composer_expanded" : ""
            }`}
            onSubmit={onSubmit}
            noValidate
            role="dialog"
            aria-modal={renderAsModal ? true : undefined}
            aria-labelledby={titleId}
            aria-describedby={bodyId}
        >
            <header className="slds-docked-composer__header slds-grid slds-shrink-none playground-task-composer__header" aria-live="assertive">
                <div className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure slds-m-right_x-small">
                        <span className="slds-icon_container" title={title}>
                            <StandardIcon className="slds-icon slds-icon_small slds-icon-text-default" name={iconName} />
                            <span className="slds-assistive-text">{title}</span>
                        </span>
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-truncate" id={titleId} title={title}>{title}</h2>
                    </div>
                </div>
                <div className="slds-col_bump-left slds-shrink-none">
                    {mobileModal ? null : (
                        <>
                            <button className="slds-button slds-button_icon slds-button_icon-bare slds-p-around_xx-small" type="button" title={minimizeTitle} onClick={onToggleMinimized}>
                                <UtilityIcon className="slds-button__icon" name="minimize_window" />
                                <span className="slds-assistive-text">{minimizeTitle}</span>
                            </button>
                            <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title={expandTitle} onClick={onToggleExpanded}>
                                <UtilityIcon className="slds-button__icon" name={expanded ? "contract_alt" : "expand_alt"} />
                                <span className="slds-assistive-text">{expandTitle}</span>
                            </button>
                        </>
                    )}
                    <button className="slds-button slds-button_icon slds-button_icon-bare slds-m-left_xx-small slds-p-around_xx-small" type="button" title="閉じる" onClick={onCancel}>
                        <UtilityIcon className="slds-button__icon" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                </div>
            </header>
            <fieldset className="slds-docked-composer__body slds-docked-composer__body_form slds-form_compound slds-grow slds-shrink slds-scrollable_y playground-task-composer__body" id={bodyId}>
                <legend className="slds-assistive-text">{title}</legend>
                {children}
            </fieldset>
            <footer className="slds-docked-composer__footer slds-shrink-none slds-grid_align-end playground-task-composer__footer">
                <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                    保存
                </button>
            </footer>
        </form>
    );

    if (renderAsModal) {
        return (
            <>
                <div className="slds-backdrop slds-backdrop_open playground-task-composer-backdrop" />
                <div className="playground-task-composer-modal">
                    {composer}
                </div>
            </>
        );
    }

    return (
        <div className="slds-docked_container playground-activity-docked-container">
            {composer}
        </div>
    );
}
