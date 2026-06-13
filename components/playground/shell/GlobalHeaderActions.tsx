"use client";

import { type MouseEvent, useId, useState } from "react";
import { StandardIcon, UtilityIcon, type StandardIconName, type UtilityIconName } from "./SldsIcon";
import { actionPopoverIds, type ActionPopoverLabel } from "./useGlobalHeaderMenus";

const actionPopoverButtons: { actionClassName: string; icon: UtilityIconName; iconClassName: string; label: ActionPopoverLabel }[] = [
    {
        actionClassName: "slds-global-actions__guidance",
        icon: "trailhead_alt",
        iconClassName: "slds-button__icon slds-global-header__icon",
        label: "ガイダンスセンター"
    },
    {
        actionClassName: "slds-global-actions__help",
        icon: "help",
        iconClassName: "slds-button__icon slds-global-header__icon",
        label: "ヘルプ"
    },
    {
        actionClassName: "slds-global-actions__setup",
        icon: "setup",
        iconClassName: "slds-button__icon slds-global-header__icon",
        label: "設定"
    }
];

const globalTaskMenuItems: { icon: StandardIconName; iconClassName: string; label: string; onSelect: "event" | "task" }[] = [
    {
        icon: "event",
        iconClassName: "slds-icon-standard-event",
        label: "新規行動",
        onSelect: "event"
    },
    {
        icon: "task",
        iconClassName: "slds-icon-standard-task",
        label: "新規ToDo",
        onSelect: "task"
    }
];

export function GlobalHeaderActions({
    activeActionPopover,
    cancelActionPopoverClose,
    cancelProfileMenuClose,
    instanceUrl,
    onCreateEvent,
    onCreateTask,
    profileMenuOpen,
    scheduleActionPopoverClose,
    scheduleProfileMenuClose,
    showNotificationBadge,
    toggleActionPopover,
    toggleNotificationBadge,
    toggleProfileMenu,
    userName
}: {
    activeActionPopover: ActionPopoverLabel | null;
    cancelActionPopoverClose: () => void;
    cancelProfileMenuClose: () => void;
    instanceUrl?: string;
    onCreateEvent?: () => void;
    onCreateTask?: () => void;
    profileMenuOpen: boolean;
    scheduleActionPopoverClose: () => void;
    scheduleProfileMenuClose: () => void;
    showNotificationBadge: boolean;
    toggleActionPopover: (label: ActionPopoverLabel) => void;
    toggleNotificationBadge: () => void;
    toggleProfileMenu: () => void;
    userName?: string;
}) {
    return (
        <ul className="slds-global-actions playground-global-actions" aria-label="グローバルアクション">
            <GlobalFavoritesActions />
            <GlobalTaskMenuButton
                open={activeActionPopover === "グローバルアクション"}
                onCreateEvent={onCreateEvent}
                onCreateTask={onCreateTask}
                onMouseEnter={cancelActionPopoverClose}
                onMouseLeave={scheduleActionPopoverClose}
                onToggle={() => toggleActionPopover("グローバルアクション")}
            />
            {actionPopoverButtons.map(({ actionClassName, icon, iconClassName, label }) => (
                <GlobalActionButton
                    key={label}
                    actionClassName={actionClassName}
                    icon={icon}
                    iconClassName={iconClassName}
                    label={label}
                    popupId={actionPopoverIds[label]}
                    popupMessage={label}
                    popupOpen={activeActionPopover === label}
                    onClick={() => toggleActionPopover(label)}
                    onMouseEnter={cancelActionPopoverClose}
                    onMouseLeave={scheduleActionPopoverClose}
                />
            ))}
            <GlobalActionButton
                actionClassName="slds-global-actions__notifications"
                icon="notification"
                iconClassName="slds-button__icon slds-global-header__icon"
                label="通知"
                notificationCount={showNotificationBadge ? 1 : undefined}
                pressed={showNotificationBadge}
                onClick={(event) => {
                    toggleNotificationBadge();
                    event.currentTarget.blur();
                }}
            />
            <GlobalProfileMenu
                instanceUrl={instanceUrl}
                open={profileMenuOpen}
                userName={userName}
                onMouseEnter={cancelProfileMenuClose}
                onMouseLeave={scheduleProfileMenuClose}
                onToggle={toggleProfileMenu}
            />
        </ul>
    );
}

function GlobalTaskMenuButton({
    onCreateEvent,
    onCreateTask,
    onMouseEnter,
    onMouseLeave,
    onToggle,
    open
}: {
    onCreateEvent?: () => void;
    onCreateTask?: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onToggle: () => void;
    open: boolean;
}) {
    function runAction(action?: () => void) {
        action?.();
        onToggle();
    }

    return (
        <li className="slds-global-actions__item slds-m-right_small playground-global-actions__mobile-hidden">
            <div
                className={`slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <button
                    className="slds-button slds-button_icon slds-button_icon-container slds-button_icon-small slds-global-actions__item-action slds-global-actions__task slds-m-top_xxx-small"
                    type="button"
                    title="グローバルアクション"
                    aria-controls={actionPopoverIds["グローバルアクション"]}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={onToggle}
                >
                    <UtilityIcon className="slds-button__icon" name="add" />
                    <span className="slds-assistive-text">グローバルアクション</span>
                </button>
                <div id={actionPopoverIds["グローバルアクション"]} className="slds-dropdown slds-dropdown_right slds-nubbin_top-right" style={{ transform: "translate(0.375rem, 0.25rem)" }}>
                    <ul className="slds-dropdown__list" role="menu" aria-label="グローバルアクション">
                        <li className="slds-dropdown__item slds-p-horizontal_small slds-p-vertical_x-small" role="presentation">
                            <span className="slds-text-body_regular">グローバルアクション</span>
                        </li>
                        {globalTaskMenuItems.map((item) => (
                            <li className="slds-dropdown__item" role="presentation" key={item.label}>
                                <a
                                    href="#"
                                    role="menuitem"
                                    tabIndex={0}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        runAction(item.onSelect === "event" ? onCreateEvent : onCreateTask);
                                    }}
                                >
                                    <span className="slds-media slds-media_center">
                                        <span className="slds-media__figure">
                                            <span className={`slds-icon_container ${item.iconClassName}`} title={item.label}>
                                                <StandardIcon className="slds-icon slds-icon_small" name={item.icon} />
                                            </span>
                                        </span>
                                        <span className="slds-media__body">
                                            <span className="slds-truncate slds-text-link" title={item.label}>{item.label}</span>
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </li>
    );
}

function GlobalFavoritesActions() {
    const favoritesMenuId = useId();
    const [favoriteSelected, setFavoriteSelected] = useState(false);
    const [favoritesMenuOpen, setFavoritesMenuOpen] = useState(false);
    const favoriteLabel = favoriteSelected ? "お気に入りから削除" : "お気に入りに追加";
    const favoriteClassName = [
        "slds-button",
        "slds-button_icon",
        "slds-global-actions__favorites-action",
        "slds-button_icon-border",
        "slds-button_icon-small",
        favoriteSelected ? "slds-is-selected" : ""
    ].filter(Boolean).join(" ");
    const favoritesContainerClassName = [
        "slds-global-actions__favorites",
        "slds-dropdown-trigger",
        "slds-dropdown-trigger_click",
        favoritesMenuOpen ? "slds-is-open" : ""
    ].filter(Boolean).join(" ");

    return (
        <li className="slds-global-actions__item slds-dropdown-trigger slds-dropdown-trigger_click slds-grid playground-global-actions__mobile-hidden">
            <div className={favoritesContainerClassName} role="group">
                <div className="slds-button-group">
                    <button
                        className={favoriteClassName}
                        type="button"
                        title={favoriteLabel}
                        aria-pressed={favoriteSelected}
                        onClick={() => setFavoriteSelected((selected) => !selected)}
                    >
                        <UtilityIcon className="slds-button__icon" name="favorite" />
                        <span className="slds-assistive-text">{favoriteLabel}</span>
                    </button>
                    <button
                        className="slds-button slds-button_icon slds-global-actions__favorites-more slds-button_icon-border slds-button_icon-small"
                        type="button"
                        title="お気に入りを表示"
                        aria-controls={favoritesMenuId}
                        aria-expanded={favoritesMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setFavoritesMenuOpen((open) => !open)}
                    >
                        <UtilityIcon className="slds-button__icon slds-button__icon_small slds-m-top_xx-small" name="down" />
                        <span className="slds-assistive-text">お気に入りを表示</span>
                    </button>
                </div>
                <div id={favoritesMenuId} className="slds-dropdown slds-dropdown_right slds-dropdown_small slds-nubbin_top-right">
                    <ul className="slds-dropdown__list" role="menu" aria-label="お気に入り">
                        {favoriteSelected ? (
                            <li className="slds-dropdown__item" role="presentation">
                                <a
                                    href="#"
                                    role="menuitem"
                                    tabIndex={favoritesMenuOpen ? 0 : -1}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setFavoritesMenuOpen(false);
                                    }}
                                >
                                    <span title="Salesforce API Playground">
                                        Salesforce API Playground
                                    </span>
                                </a>
                            </li>
                        ) : (
                            <li className="slds-dropdown__item slds-p-horizontal_small slds-p-vertical_x-small" role="presentation">
                                <span className="slds-text-color_weak">お気に入りはありません</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </li>
    );
}

function GlobalActionButton({
    actionClassName,
    icon,
    iconClassName,
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
    actionClassName: string;
    icon: UtilityIconName;
    iconClassName: string;
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
        <li className="slds-global-actions__item playground-global-actions__mobile-hidden">
            <div
                className={`slds-dropdown-trigger slds-dropdown-trigger_click ${popupOpen ? "slds-is-open" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <button
                    className={`slds-button slds-button_icon slds-button_icon-container slds-button_icon-small slds-global-actions__item-action ${actionClassName} ${
                        notificationCount ? "slds-incoming-notification" : ""
                    }`}
                    type="button"
                    title={label}
                    aria-controls={popupMessage ? popupId : undefined}
                    aria-haspopup={popupMessage ? "dialog" : undefined}
                    aria-expanded={popupMessage ? popupOpen : undefined}
                    aria-pressed={pressed}
                    onClick={onClick}
                >
                    <UtilityIcon className={iconClassName} name={icon} />
                    <span className="slds-assistive-text">{label}</span>
                </button>
                {notificationCount ? (
                    <span className="slds-notification-badge slds-incoming-notification slds-show-notification" aria-hidden="true">
                        {notificationCount}
                    </span>
                ) : null}
                {popupMessage ? (
                    <div id={popupId} className="slds-dropdown slds-dropdown_right slds-dropdown_small slds-nubbin_top-right" style={{ transform: "translate(0.375rem, 0.25rem)" }}>
                        <div className="slds-p-around_small slds-text-body_regular">{popupMessage}</div>
                    </div>
                ) : null}
            </div>
        </li>
    );
}

function GlobalProfileMenu({
    instanceUrl,
    open,
    userName,
    onMouseEnter,
    onMouseLeave,
    onToggle
}: {
    instanceUrl?: string;
    open: boolean;
    userName?: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onToggle: () => void;
}) {
    const displayName = userName || "Salesforce ユーザー";
    const organizationLabel = instanceUrl || "接続済みの組織";

    return (
        <li className="slds-global-actions__item playground-global-actions__profile">
            <div
                className={`slds-dropdown-trigger slds-dropdown-trigger_click ${open ? "slds-is-open" : ""}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <button
                    className="slds-button slds-global-actions__avatar slds-global-actions__item-action"
                    type="button"
                    title="ユーザープロファイル"
                    aria-controls="profile-menu"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    onClick={onToggle}
                >
                    <span className="slds-avatar slds-avatar_circle slds-avatar_medium slds-avatar_profile-image-medium">
                        <span className="slds-assistive-text">ユーザー</span>
                    </span>
                    <span className="slds-assistive-text">ユーザープロファイル</span>
                </button>
                {open ? (
                    <section
                        id="profile-menu"
                        className="slds-popover slds-nubbin_top-right playground-profile-popover"
                        role="dialog"
                        aria-label="ユーザープロファイル"
                    >
                        <button
                            className="slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close"
                            type="button"
                            title="閉じる"
                            onClick={onToggle}
                        >
                            <UtilityIcon className="slds-button__icon" name="close" />
                            <span className="slds-assistive-text">閉じる</span>
                        </button>
                        <div className="slds-popover__body slds-p-around_none">
                            <div className="slds-media slds-p-around_medium">
                                <div className="slds-media__figure">
                                    <span className="slds-avatar slds-avatar_circle slds-avatar_large slds-avatar_profile-image-large">
                                        <span className="slds-assistive-text">ユーザー</span>
                                    </span>
                                </div>
                                <div className="slds-media__body">
                                    <div className="slds-text-heading_medium slds-truncate" title={displayName}>
                                        {displayName}
                                    </div>
                                    <div className="slds-text-body_regular slds-truncate" title={organizationLabel}>
                                        {organizationLabel}
                                    </div>
                                    <div className="slds-m-top_x-small">
                                        <form className="slds-display_inline" action="/api/auth/logout" method="post">
                                            <button className="slds-button_reset slds-text-link" type="submit">
                                                ログアウト
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}
            </div>
        </li>
    );
}
