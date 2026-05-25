"use client";

import Image, { type StaticImageData } from "next/image";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { salesforceLogo, utilityIcons } from "./icons";

export function GlobalHeader({ connected }: { connected: boolean }) {
    const actionPopoverCloseTimer = useRef<number | null>(null);
    const profileMenuCloseTimer = useRef<number | null>(null);
    const [activeActionPopover, setActiveActionPopover] = useState<string | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotificationBadge, setShowNotificationBadge] = useState(false);

    function blurGlobalAction(event: MouseEvent<HTMLButtonElement>): void {
        event.currentTarget.blur();
    }

    function cancelProfileMenuClose(): void {
        if (profileMenuCloseTimer.current) {
            window.clearTimeout(profileMenuCloseTimer.current);
            profileMenuCloseTimer.current = null;
        }
    }

    function scheduleProfileMenuClose(): void {
        cancelProfileMenuClose();
        profileMenuCloseTimer.current = window.setTimeout(() => {
            setProfileMenuOpen(false);
            profileMenuCloseTimer.current = null;
        }, 250);
    }

    function cancelActionPopoverClose(): void {
        if (actionPopoverCloseTimer.current) {
            window.clearTimeout(actionPopoverCloseTimer.current);
            actionPopoverCloseTimer.current = null;
        }
    }

    function scheduleActionPopoverClose(): void {
        cancelActionPopoverClose();
        actionPopoverCloseTimer.current = window.setTimeout(() => {
            setActiveActionPopover(null);
            actionPopoverCloseTimer.current = null;
        }, 250);
    }

    function showActionPopover(label: string, event: MouseEvent<HTMLButtonElement>): void {
        cancelActionPopoverClose();
        setActiveActionPopover(label);
        event.currentTarget.blur();
    }

    useEffect(() => {
        return () => {
            cancelActionPopoverClose();
            cancelProfileMenuClose();
        };
    }, []);

    return (
        <header className="slds-global-header_container playground-global-header-container">
            <div className="slds-global-header slds-grid slds-grid_align-spread">
                <div className="slds-global-header__item">
                    <Image
                        className="salesforce-brand-logo"
                        src={salesforceLogo}
                        alt="Salesforce"
                        width={58}
                        height={40}
                        priority
                    />
                </div>
                <div className="slds-global-header__item slds-global-header__item_search slds-show_medium">
                    <div className="slds-form-element slds-lookup slds-is-close">
                        <label className="slds-assistive-text" htmlFor="global-search">
                            Search
                        </label>
                        <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left slds-global-search__form-element">
                            <Image
                                className="slds-input__icon slds-input__icon_left playground-global-search-icon"
                                src={utilityIcons.search}
                                alt=""
                                width={16}
                                height={16}
                                aria-hidden="true"
                            />
                            <input
                                id="global-search"
                                className="slds-input slds-lookup__search-input"
                                type="search"
                                placeholder="Search Salesforce"
                                disabled={!connected}
                            />
                        </div>
                    </div>
                </div>
                <div className="slds-global-header__item">
                    {connected ? (
                        <ul className="slds-global-actions" aria-label="Global actions">
                            <GlobalActionButton
                                icon={utilityIcons.add}
                                label="Global Actions"
                                popupMessage="Global Actions"
                                popupOpen={activeActionPopover === "Global Actions"}
                                onClick={(event) => showActionPopover("Global Actions", event)}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.help}
                                label="Help"
                                popupMessage="Help"
                                popupOpen={activeActionPopover === "Help"}
                                onClick={(event) => showActionPopover("Help", event)}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.settings}
                                label="Setup"
                                popupMessage="Setup"
                                popupOpen={activeActionPopover === "Setup"}
                                onClick={(event) => showActionPopover("Setup", event)}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.notification}
                                label="Notifications"
                                notificationCount={showNotificationBadge ? 1 : undefined}
                                pressed={showNotificationBadge}
                                onClick={(event) => {
                                    setShowNotificationBadge((visible) => !visible);
                                    event.currentTarget.blur();
                                }}
                            />
                            <li className="slds-global-actions__item">
                                <div
                                    className={`slds-dropdown-trigger slds-dropdown-trigger_click playground-profile-menu ${
                                        profileMenuOpen ? "slds-is-open playground-profile-menu_open" : ""
                                    }`}
                                    onMouseEnter={cancelProfileMenuClose}
                                    onMouseLeave={scheduleProfileMenuClose}
                                >
                                    <button
                                        className="slds-button slds-global-actions__avatar slds-global-actions__item-action"
                                        type="button"
                                        title="User profile"
                                        aria-haspopup="true"
                                        aria-expanded={profileMenuOpen}
                                        onClick={(event) => {
                                            setProfileMenuOpen(true);
                                            event.currentTarget.blur();
                                        }}
                                    >
                                        <span className="slds-avatar slds-avatar_circle slds-avatar_medium">
                                            <Image
                                                className="playground-global-action-icon"
                                                src={utilityIcons.user}
                                                alt=""
                                                width={32}
                                                height={32}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="slds-assistive-text">User profile</span>
                                    </button>
                                    <div className="slds-dropdown slds-dropdown_right slds-dropdown_actions slds-dropdown_small playground-profile-dropdown">
                                        <ul className="slds-dropdown__list" role="menu" aria-label="User profile menu">
                                            <li className="slds-dropdown__item" role="presentation">
                                                <form action="/api/auth/logout" method="post">
                                                    <button
                                                        className="slds-button_reset slds-size_full slds-p-vertical_x-small slds-p-horizontal_small playground-logout-action"
                                                        type="submit"
                                                        role="menuitem"
                                                    >
                                                        <span className="slds-icon_container slds-icon-utility-logout slds-m-right_x-small">
                                                            <Image
                                                                className="slds-icon slds-icon_x-small playground-menu-icon"
                                                                src={utilityIcons.logout}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                        <span className="slds-truncate" title="Log Out">
                                                            Log Out
                                                        </span>
                                                    </button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    ) : (
                        <a className="slds-button slds-button_brand heroku-brand-action" href="/api/auth/login">
                            Connect Salesforce
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}

function GlobalActionButton({
    icon,
    label,
    notificationCount,
    onClick,
    onMouseEnter,
    onMouseLeave,
    popupMessage,
    popupOpen = false,
    pressed
}: {
    icon: StaticImageData;
    label: string;
    notificationCount?: number;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    popupMessage?: string;
    popupOpen?: boolean;
    pressed?: boolean;
}) {
    return (
        <li className="slds-global-actions__item">
            <div
                className={`slds-dropdown-trigger slds-dropdown-trigger_click playground-global-action-menu ${
                    popupOpen ? "slds-is-open playground-global-action-menu_open" : ""
                }`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <button
                    className="slds-button slds-button_icon slds-button_icon-container slds-global-actions__item-action playground-global-action"
                    type="button"
                    title={label}
                    aria-haspopup={popupMessage ? true : undefined}
                    aria-expanded={popupMessage ? popupOpen : undefined}
                    aria-pressed={pressed}
                    onClick={onClick}
                >
                    <Image className="slds-button__icon playground-global-action-icon" src={icon} alt="" width={20} height={20} aria-hidden="true" />
                    {notificationCount ? <span className="slds-notification-badge slds-show-notification">{notificationCount}</span> : null}
                    <span className="slds-assistive-text">{label}</span>
                </button>
                {popupMessage ? (
                    <div className="slds-dropdown slds-dropdown_right slds-dropdown_small playground-global-action-popup">
                        <div className="slds-p-around_small slds-text-body_regular">{popupMessage}</div>
                    </div>
                ) : null}
            </div>
        </li>
    );
}
