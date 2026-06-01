"use client";

import Image, { type StaticImageData } from "next/image";
import { type ChangeEvent, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest } from "./api";
import { getContactName } from "./formatting";
import { salesforceLogo, standardIcons, utilityIcons } from "./icons";

const actionPopoverIds = {
    "グローバルアクション": "global-action-popover",
    ヘルプ: "global-help-popover",
    設定: "global-settings-popover"
} as const;

type ActionPopoverLabel = keyof typeof actionPopoverIds;

type GlobalHeaderProps = {
    connected: boolean;
    onSelectSearchResult?: (result: SearchResultItem) => void;
};

function getResultLabel(result: SearchResultItem): string {
    return result.type === "account" ? result.record.Name : getContactName(result.record);
}

function getResultMeta(result: SearchResultItem): string {
    if (result.type === "account") {
        return [result.record.BillingCity, result.record.BillingCountry, result.record.Phone]
            .filter(Boolean)
            .join(" / ") || "取引先";
    }

    return [result.record.Account?.Name, result.record.Title, result.record.Email]
        .filter(Boolean)
        .join(" / ") || "取引先責任者";
}

function getResultIconContainerClass(result: SearchResultItem): string {
    const objectIconClass = result.type === "account" ? "slds-icon-standard-account" : "slds-icon-standard-contact";

    return `slds-icon_container ${objectIconClass} playground-global-search-result__icon-container`;
}

export function GlobalHeader({ connected, onSelectSearchResult }: GlobalHeaderProps) {
    const actionPopoverCloseTimer = useRef<number | null>(null);
    const profileMenuCloseTimer = useRef<number | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const searchRequestId = useRef(0);
    const [activeActionPopover, setActiveActionPopover] = useState<ActionPopoverLabel | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotificationBadge, setShowNotificationBadge] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [activeSearchIndex, setActiveSearchIndex] = useState(-1);

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

    function closeMenus(): void {
        cancelActionPopoverClose();
        cancelProfileMenuClose();
        setActiveActionPopover(null);
        setProfileMenuOpen(false);
        setSearchOpen(false);
    }

    function scheduleActionPopoverClose(): void {
        cancelActionPopoverClose();
        actionPopoverCloseTimer.current = window.setTimeout(() => {
            setActiveActionPopover(null);
            actionPopoverCloseTimer.current = null;
        }, 250);
    }

    function toggleActionPopover(label: ActionPopoverLabel): void {
        cancelActionPopoverClose();
        setProfileMenuOpen(false);
        setActiveActionPopover((currentLabel) => (currentLabel === label ? null : label));
    }

    function toggleProfileMenu(): void {
        cancelProfileMenuClose();
        setActiveActionPopover(null);
        setProfileMenuOpen((isOpen) => !isOpen);
    }

    function closeOnEscape(event: KeyboardEvent): void {
        if (event.key !== "Escape") {
            return;
        }

        closeMenus();
    }

    function changeSearchQuery(event: ChangeEvent<HTMLInputElement>): void {
        setSearchQuery(event.target.value);
        setSearchOpen(true);
        setActiveSearchIndex(-1);
    }

    function selectSearchResult(result: SearchResultItem): void {
        onSelectSearchResult?.(result);
        setSearchQuery(getResultLabel(result));
        setSearchOpen(false);
        setActiveSearchIndex(-1);
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (!searchOpen || searchResults.length === 0) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveSearchIndex((currentIndex) => (currentIndex + 1) % searchResults.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveSearchIndex((currentIndex) =>
                currentIndex <= 0 ? searchResults.length - 1 : currentIndex - 1
            );
        } else if (event.key === "Enter" && activeSearchIndex >= 0) {
            event.preventDefault();
            selectSearchResult(searchResults[activeSearchIndex]);
        }
    }

    useEffect(() => {
        function closeOnPointerDown(event: PointerEvent): void {
            if (!headerRef.current?.contains(event.target as Node)) {
                if (actionPopoverCloseTimer.current) {
                    window.clearTimeout(actionPopoverCloseTimer.current);
                    actionPopoverCloseTimer.current = null;
                }
                if (profileMenuCloseTimer.current) {
                    window.clearTimeout(profileMenuCloseTimer.current);
                    profileMenuCloseTimer.current = null;
                }
                setActiveActionPopover(null);
                setProfileMenuOpen(false);
                setSearchOpen(false);
            }
        }

        document.addEventListener("pointerdown", closeOnPointerDown);
        return () => {
            document.removeEventListener("pointerdown", closeOnPointerDown);
            if (actionPopoverCloseTimer.current) {
                window.clearTimeout(actionPopoverCloseTimer.current);
                actionPopoverCloseTimer.current = null;
            }
            if (profileMenuCloseTimer.current) {
                window.clearTimeout(profileMenuCloseTimer.current);
                profileMenuCloseTimer.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!connected) {
            searchRequestId.current += 1;
            setSearchQuery("");
            setSearchResults([]);
            setSearchMessage(null);
            setSearchLoading(false);
            setSearchOpen(false);
            return;
        }

        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            searchRequestId.current += 1;
            setSearchResults([]);
            setSearchMessage("検索キーワードを入力してください。");
            setSearchLoading(false);
            return;
        }

        if (trimmedQuery.length < 2) {
            searchRequestId.current += 1;
            setSearchResults([]);
            setSearchMessage("2 文字以上で検索してください。");
            setSearchLoading(false);
            return;
        }

        const requestId = searchRequestId.current + 1;
        searchRequestId.current = requestId;
        setSearchLoading(true);
        setSearchMessage(null);

        const timer = window.setTimeout(() => {
            apiRequest<{ results: SearchResultItem[] }>(
                buildPlaygroundApiRequest(playgroundApiPaths.search(trimmedQuery))
            )
                .then(({ results }) => {
                    if (searchRequestId.current !== requestId) {
                        return;
                    }

                    setSearchResults(results);
                    setSearchMessage(results.length === 0 ? "検索結果がありません。" : null);
                    setActiveSearchIndex(results.length > 0 ? 0 : -1);
                })
                .catch((error) => {
                    if (searchRequestId.current !== requestId) {
                        return;
                    }

                    setSearchResults([]);
                    setSearchMessage(error instanceof Error ? error.message : "検索に失敗しました。");
                    setActiveSearchIndex(-1);
                })
                .finally(() => {
                    if (searchRequestId.current === requestId) {
                        setSearchLoading(false);
                    }
                });
        }, 250);

        return () => {
            window.clearTimeout(timer);
        };
    }, [connected, searchQuery]);

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
                    <div className={`slds-form-element slds-lookup ${searchOpen ? "slds-is-open" : "slds-is-close"}`}>
                        <label className="slds-assistive-text" htmlFor="global-search">
                            検索
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
                                placeholder="Salesforce を検索"
                                disabled={!connected}
                                autoComplete="off"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-controls="global-search-results"
                                aria-expanded={searchOpen}
                                aria-activedescendant={
                                    searchOpen && activeSearchIndex >= 0
                                        ? `global-search-result-${activeSearchIndex}`
                                        : undefined
                                }
                                value={searchQuery}
                                onChange={changeSearchQuery}
                                onFocus={() => setSearchOpen(true)}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>
                        {connected && searchOpen ? (
                            <div
                                id="global-search-results"
                                className="slds-lookup__menu slds-dropdown slds-dropdown_fluid playground-global-search-results"
                                role="listbox"
                                aria-label="検索候補"
                            >
                                {searchLoading ? (
                                    <div className="slds-lookup__item slds-p-around_small" role="status">
                                        検索中...
                                    </div>
                                ) : null}
                                {!searchLoading && searchResults.length > 0 ? (
                                    <ul className="slds-lookup__list" role="presentation">
                                        {searchResults.map((result, index) => (
                                            <li
                                                key={`${result.type}-${result.record.Id}`}
                                                id={`global-search-result-${index}`}
                                                className={`slds-lookup__item playground-global-search-result ${
                                                    activeSearchIndex === index ? "playground-global-search-result_active" : ""
                                                }`}
                                                role="option"
                                                aria-selected={activeSearchIndex === index}
                                            >
                                                <button
                                                    className="slds-button_reset slds-size_full slds-p-vertical_x-small slds-p-horizontal_small playground-global-search-result__button"
                                                    type="button"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => selectSearchResult(result)}
                                                >
                                                    <span className="slds-media slds-media_center">
                                                        <span className="slds-media__figure">
                                                            <span className={getResultIconContainerClass(result)}>
                                                                <Image
                                                                    className="slds-icon slds-icon_small playground-global-search-result__icon"
                                                                    src={result.type === "account" ? standardIcons.accounts : standardIcons.contacts}
                                                                    alt=""
                                                                    width={24}
                                                                    height={24}
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        </span>
                                                        <span className="slds-media__body">
                                                            <span className="slds-truncate playground-global-search-result__label">
                                                                {getResultLabel(result)}
                                                            </span>
                                                            <span className="slds-truncate playground-global-search-result__meta">
                                                                {result.type === "account" ? "取引先" : "取引先責任者"} / {getResultMeta(result)}
                                                            </span>
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                                {!searchLoading && searchMessage ? (
                                    <div className="slds-lookup__item slds-p-around_small" role="status">
                                        {searchMessage}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="slds-global-header__item">
                    {connected ? (
                        <ul className="slds-global-actions" aria-label="グローバルアクション">
                            <GlobalActionButton
                                icon={utilityIcons.add}
                                label="グローバルアクション"
                                popupId={actionPopoverIds["グローバルアクション"]}
                                popupMessage="グローバルアクション"
                                popupOpen={activeActionPopover === "グローバルアクション"}
                                onClick={() => toggleActionPopover("グローバルアクション")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.help}
                                label="ヘルプ"
                                popupId={actionPopoverIds["ヘルプ"]}
                                popupMessage="ヘルプ"
                                popupOpen={activeActionPopover === "ヘルプ"}
                                onClick={() => toggleActionPopover("ヘルプ")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.settings}
                                label="設定"
                                popupId={actionPopoverIds["設定"]}
                                popupMessage="設定"
                                popupOpen={activeActionPopover === "設定"}
                                onClick={() => toggleActionPopover("設定")}
                                onMouseEnter={cancelActionPopoverClose}
                                onMouseLeave={scheduleActionPopoverClose}
                            />
                            <GlobalActionButton
                                icon={utilityIcons.notification}
                                label="通知"
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
                                        title="ユーザープロファイル"
                                        aria-controls="profile-menu"
                                        aria-haspopup="menu"
                                        aria-expanded={profileMenuOpen}
                                        onClick={toggleProfileMenu}
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
                                                            <Image
                                                                className="slds-icon slds-icon_x-small playground-menu-icon"
                                                                src={utilityIcons.logout}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                aria-hidden="true"
                                                            />
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
    icon: StaticImageData;
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
                    <Image className="slds-button__icon playground-global-action-icon" src={icon} alt="" width={20} height={20} aria-hidden="true" />
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
