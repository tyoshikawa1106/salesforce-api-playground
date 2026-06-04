"use client";

import Image from "next/image";
import { type MouseEvent } from "react";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { GlobalSearch } from "./GlobalSearch";
import { salesforceLogo } from "./icons";
import { UtilityIcon, type UtilityIconName } from "./SldsIcon";
import { actionPopoverIds, useGlobalHeaderMenus } from "./useGlobalHeaderMenus";

type GlobalHeaderProps = {
    connected: boolean;
    onSelectSearchResult?: (result: SearchResultItem) => void;
};

export function GlobalHeader({ connected, onSelectSearchResult }: GlobalHeaderProps) {
    const {
        activeActionPopover,
        cancelActionPopoverClose,
        cancelProfileMenuClose,
        closeOnEscape,
        headerRef,
        profileMenuOpen,
        scheduleActionPopoverClose,
        scheduleProfileMenuClose,
        showNotificationBadge,
        toggleActionPopover,
        toggleNotificationBadge,
        toggleProfileMenu
    } = useGlobalHeaderMenus();

    return (
        <header ref={headerRef} className="slds-global-header_container playground-global-header-container" onKeyDown={closeOnEscape}>
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
                    <GlobalSearch connected={connected} onSelectSearchResult={onSelectSearchResult} />
                </div>
                <div className="slds-global-header__item">
                    {connected ? (
                        <ul className="slds-global-actions" aria-label="グローバルアクション">
                            <GlobalActionButton
                                icon="add"
                                label="グローバルアクション"
                                popupId={actionPopoverIds["グローバルアクション"]}
                                popupMessage="グローバルアクション"
                                popupOpen={activeActionPopover === "グローバルアクション"}
                                onClick={() => toggleActionPopover("グローバルアクション")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon="help"
                                label="ヘルプ"
                                popupId={actionPopoverIds["ヘルプ"]}
                                popupMessage="ヘルプ"
                                popupOpen={activeActionPopover === "ヘルプ"}
                                onClick={() => toggleActionPopover("ヘルプ")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon="settings"
                                label="設定"
                                popupId={actionPopoverIds["設定"]}
                                popupMessage="設定"
                                popupOpen={activeActionPopover === "設定"}
                                onClick={() => toggleActionPopover("設定")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon="notification"
                                label="通知"
                                notificationCount={showNotificationBadge ? 1 : undefined}
                                pressed={showNotificationBadge}
                                onClick={(event) => {
                                    toggleNotificationBadge();
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
                                        title="ユーザープロファイル"
                                        aria-controls="profile-menu"
                                        aria-haspopup="menu"
                                        aria-expanded={profileMenuOpen}
                                        onClick={toggleProfileMenu}
                                    >
                                        <span className="slds-avatar slds-avatar_circle slds-avatar_medium">
                                            <UtilityIcon className="slds-icon playground-global-action-icon" name="user" />
                                        </span>
                                        <span className="slds-assistive-text">ユーザープロファイル</span>
                                    </button>
                                    <div
                                        id="profile-menu"
                                        className="slds-dropdown slds-dropdown_right slds-dropdown_actions slds-dropdown_small playground-profile-dropdown"
                                    >
                                        <ul className="slds-dropdown__list" role="menu" aria-label="ユーザープロファイルメニュー">
                                            <li className="slds-dropdown__item" role="presentation">
                                                <form action="/api/auth/logout" method="post" role="presentation">
                                                    <button
                                                        className="slds-button_reset slds-size_full slds-p-vertical_x-small slds-p-horizontal_small playground-logout-action"
                                                        type="submit"
                                                        role="menuitem"
                                                    >
                                                        <span className="slds-icon_container slds-icon-utility-logout slds-m-right_x-small">
                                                            <UtilityIcon className="slds-icon slds-icon_x-small playground-menu-icon" name="logout" />
                                                        </span>
                                                        <span className="slds-truncate" title="ログアウト">
                                                            ログアウト
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
                            Salesforce に接続
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
    popupId,
    popupMessage,
    popupOpen = false,
    pressed
}: {
    icon: UtilityIconName;
    label: string;
    notificationCount?: number;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    popupId?: string;
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
                    aria-controls={popupMessage ? popupId : undefined}
                    aria-haspopup={popupMessage ? "dialog" : undefined}
                    aria-expanded={popupMessage ? popupOpen : undefined}
                    aria-pressed={pressed}
                    onClick={onClick}
                >
                    <UtilityIcon className="slds-button__icon playground-global-action-icon" name={icon} />
                    {notificationCount ? <span className="slds-notification-badge slds-show-notification">{notificationCount}</span> : null}
                    <span className="slds-assistive-text">{label}</span>
                </button>
                {popupMessage ? (
                    <div id={popupId} className="slds-dropdown slds-dropdown_right slds-dropdown_small playground-global-action-popup">
                        <div className="slds-p-around_small slds-text-body_regular">{popupMessage}</div>
                    </div>
                ) : null}
            </div>
        </li>
    );
}
