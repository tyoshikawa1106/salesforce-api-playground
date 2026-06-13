"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ActiveTab } from "./types";
import { getStandardIconName, StandardIcon, UtilityIcon, type UtilityIconName } from "./SldsIcon";

type NavigationTab = {
    hasMenu?: boolean;
    label: string;
    menuId?: string;
    tab: ActiveTab;
};

const baseNavigationTabs: NavigationTab[] = [
    { label: "ホーム", tab: "home" },
    { hasMenu: true, label: "取引先", menuId: "accounts-navigation-menu", tab: "accounts" },
    { hasMenu: true, label: "取引先責任者", menuId: "contacts-navigation-menu", tab: "contacts" },
    { label: "連携", tab: "integration" },
    { label: "ごみ箱", tab: "recycleBin" }
];

export function getVisibleNavigationCount(containerWidth: number, itemWidths: number[], overflowMenuWidth: number) {
    if (itemWidths.length === 0) {
        return 0;
    }

    const totalWidth = itemWidths.reduce((total, width) => total + width, 0);

    if (totalWidth <= containerWidth) {
        return itemWidths.length;
    }

    let usedWidth = 0;

    for (let index = 0; index < itemWidths.length; index += 1) {
        const nextWidth = itemWidths[index];

        if (usedWidth + nextWidth + overflowMenuWidth > containerWidth) {
            return index;
        }

        usedWidth += nextWidth;
    }

    return itemWidths.length;
}

export function AppNavigation({
    activeTab,
    connected,
    onChange
}: {
    activeTab: ActiveTab;
    connected: boolean;
    onChange: (tab: ActiveTab) => void;
}) {
    const [visibleTabCount, setVisibleTabCount] = useState(baseNavigationTabs.length);
    const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
    const secondaryNavRef = useRef<HTMLElement | null>(null);
    const measuredItemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const measuredOverflowRef = useRef<HTMLLIElement | null>(null);
    const navigationTabs = useMemo(() => (
        connected ? baseNavigationTabs : baseNavigationTabs.filter((item) => item.tab === "home")
    ), [connected]);
    const visibleTabs = navigationTabs.slice(0, visibleTabCount);
    const overflowTabs = navigationTabs.slice(visibleTabCount);
    const overflowContainsActiveTab = overflowTabs.some((item) => item.tab === activeTab);

    const updateVisibleTabCount = useCallback(() => {
        const containerWidth = secondaryNavRef.current?.getBoundingClientRect().width ?? 0;
        const itemWidths = navigationTabs.map((_, index) => Math.ceil(measuredItemRefs.current[index]?.getBoundingClientRect().width ?? 0));
        const overflowMenuWidth = Math.ceil(measuredOverflowRef.current?.getBoundingClientRect().width ?? 0);

        if (containerWidth === 0 || overflowMenuWidth === 0 || itemWidths.some((width) => width === 0)) {
            return;
        }

        const nextVisibleTabCount = getVisibleNavigationCount(containerWidth, itemWidths, overflowMenuWidth);
        setVisibleTabCount((currentCount) => currentCount === nextVisibleTabCount ? currentCount : nextVisibleTabCount);
    }, [navigationTabs]);

    useLayoutEffect(() => {
        setVisibleTabCount(navigationTabs.length);

        const animationFrame = window.requestAnimationFrame(updateVisibleTabCount);

        return () => window.cancelAnimationFrame(animationFrame);
    }, [navigationTabs.length, updateVisibleTabCount]);

    useLayoutEffect(() => {
        const secondaryNav = secondaryNavRef.current;

        if (!secondaryNav) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => updateVisibleTabCount());
        resizeObserver.observe(secondaryNav);
        updateVisibleTabCount();

        return () => resizeObserver.disconnect();
    }, [updateVisibleTabCount]);

    useEffect(() => {
        if (overflowTabs.length === 0) {
            setOverflowMenuOpen(false);
        }
    }, [overflowTabs.length]);

    function changeNavigationTab(tab: ActiveTab) {
        setOverflowMenuOpen(false);
        onChange(tab);
    }

    return (
        <div id="app-navigation" className="slds-context-bar playground-context-bar">
            <div className="slds-context-bar__primary">
                <div className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click slds-no-hover">
                    <div className="slds-context-bar__icon-action">
                        <button className="slds-button slds-icon-waffle_container slds-context-bar__button" type="button" title="アプリケーションランチャーを開く">
                            <AppLauncherIcon />
                            <span className="slds-assistive-text">アプリケーションランチャーを開く</span>
                        </button>
                    </div>
                    <span className="slds-context-bar__label-action slds-context-bar__app-name">
                        <span className="slds-truncate" title="Heroku">
                            Heroku
                        </span>
                    </span>
                </div>
            </div>
            <nav ref={secondaryNavRef} className="slds-context-bar__secondary" role="navigation" aria-label="主要ナビゲーション">
                <ul className="slds-grid">
                    {visibleTabs.map((item) => (
                        <NavigationItem
                            key={item.tab}
                            active={activeTab === item.tab}
                            hasMenu={item.hasMenu}
                            label={item.label}
                            menuId={item.menuId}
                            onSelect={() => changeNavigationTab(item.tab)}
                        />
                    ))}
                    {overflowTabs.length > 0 ? (
                        <OverflowNavigationItem
                            active={overflowContainsActiveTab}
                            items={overflowTabs}
                            open={overflowMenuOpen}
                            selectedTab={activeTab}
                            onSelect={changeNavigationTab}
                            onToggle={() => setOverflowMenuOpen((open) => !open)}
                        />
                    ) : null}
                </ul>
                <div
                    aria-hidden="true"
                    style={{
                        height: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                        position: "absolute",
                        visibility: "hidden",
                        whiteSpace: "nowrap"
                    }}
                >
                    <ul className="slds-grid">
                        {navigationTabs.map((item, index) => (
                            <MeasurementNavigationItem
                                key={item.tab}
                                hasMenu={item.hasMenu}
                                label={item.label}
                                refCallback={(element) => {
                                    measuredItemRefs.current[index] = element;
                                }}
                            />
                        ))}
                        <MeasurementOverflowNavigationItem refCallback={(element) => {
                            measuredOverflowRef.current = element;
                        }} />
                    </ul>
                </div>
            </nav>
        </div>
    );
}

function AppLauncherIcon() {
    return (
        <span className="slds-icon-waffle" aria-hidden="true">
            <span className="slds-r1" />
            <span className="slds-r2" />
            <span className="slds-r3" />
            <span className="slds-r4" />
            <span className="slds-r5" />
            <span className="slds-r6" />
            <span className="slds-r7" />
            <span className="slds-r8" />
            <span className="slds-r9" />
        </span>
    );
}

function MeasurementNavigationItem({
    hasMenu,
    label,
    refCallback
}: {
    hasMenu?: boolean;
    label: string;
    refCallback: (element: HTMLLIElement | null) => void;
}) {
    const itemClassName = [
        "slds-context-bar__item",
        hasMenu ? "slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click" : ""
    ].filter(Boolean).join(" ");

    return (
        <li ref={refCallback} className={itemClassName}>
            <a href="#" className="slds-context-bar__label-action" tabIndex={-1}>
                <span className="slds-truncate" title={label}>
                    {label}
                </span>
            </a>
            {hasMenu ? (
                <div className="slds-context-bar__icon-action slds-p-left_none">
                    <button className="slds-button slds-button_icon slds-context-bar__button" type="button" tabIndex={-1}>
                        <UtilityIcon className="slds-icon slds-icon-text-default slds-icon_xx-small slds-m-left_xxx-small slds-m-top_xxx-small" name="chevrondown" />
                    </button>
                </div>
            ) : null}
        </li>
    );
}

function MeasurementOverflowNavigationItem({ refCallback }: { refCallback: (element: HTMLLIElement | null) => void }) {
    return (
        <li ref={refCallback} className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click">
            <a href="#" className="slds-context-bar__label-action" tabIndex={-1}>
                <span className="slds-truncate" title="さらに表示">
                    さらに表示
                </span>
            </a>
            <div className="slds-context-bar__icon-action slds-p-left_none">
                <button className="slds-button slds-button_icon slds-context-bar__button" type="button" tabIndex={-1}>
                    <UtilityIcon className="slds-button__icon slds-button__icon_small" name="down" />
                </button>
            </div>
        </li>
    );
}

function NavigationItem({
    active,
    hasMenu = false,
    label,
    menuId,
    onSelect
}: {
    active: boolean;
    hasMenu?: boolean;
    label: string;
    menuId?: string;
    onSelect: () => void;
}) {
    const itemClassName = [
        "slds-context-bar__item",
        active ? "slds-is-active" : "",
        active ? "playground-context-bar__item_active" : "",
        hasMenu ? "slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click" : ""
    ].filter(Boolean).join(" ");
    const menuGroupId = menuId ? `${menuId}-group` : undefined;

    return (
        <li className={itemClassName}>
            <a
                href="#"
                className="slds-context-bar__label-action"
                title={label}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                    event.preventDefault();
                    onSelect();
                }}
            >
                {active ? <span className="slds-assistive-text">Current Page:</span> : null}
                <span className="slds-truncate" title={label}>
                    {label}
                </span>
            </a>
            {hasMenu ? (
                <>
                    <div className="slds-context-bar__icon-action slds-p-left_none">
                        <button className="slds-button slds-button_icon slds-context-bar__button" type="button" aria-haspopup="true" title={`${label} のサブメニューを開く`}>
                            <UtilityIcon className="slds-icon slds-icon-text-default slds-icon_xx-small slds-m-left_xxx-small slds-m-top_xxx-small" name="chevrondown" />
                            <span className="slds-assistive-text">{label} のサブメニューを開く</span>
                        </button>
                    </div>
                    <div className="slds-dropdown slds-dropdown_right">
                        <ul className="slds-dropdown__list" role="menu">
                            <li className="slds-dropdown__item" role="presentation">
                                <a href="#" role="menuitem" tabIndex={-1} onClick={(event) => event.preventDefault()}>
                                    <span title={`${label} の主操作`}>
                                        <UtilityIcon className="slds-icon slds-icon_x-small slds-icon-text-default slds-m-right_x-small" name="add" />
                                        主操作
                                    </span>
                                </a>
                            </li>
                            <li role="presentation">
                                <ul role="group" aria-labelledby={menuGroupId}>
                                    <li className="slds-dropdown__header slds-has-divider_top-space" role="presentation" id={menuGroupId}>
                                        <span>{label}</span>
                                    </li>
                                    <li className="slds-dropdown__item" role="presentation">
                                        <a href="#" role="menuitem" tabIndex={-1} onClick={(event) => event.preventDefault()}>
                                            <span title={`${label} を表示`}>{label} を表示</span>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </>
            ) : null}
        </li>
    );
}

function OverflowNavigationItem({
    active,
    items,
    onSelect,
    onToggle,
    open,
    selectedTab
}: {
    active: boolean;
    items: NavigationTab[];
    onSelect: (tab: ActiveTab) => void;
    onToggle: () => void;
    open: boolean;
    selectedTab: ActiveTab;
}) {
    const itemClassName = [
        "slds-context-bar__item",
        active ? "slds-is-active" : "",
        active ? "playground-context-bar__item_active" : "",
        "slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click",
        open ? "slds-is-open" : ""
    ].filter(Boolean).join(" ");

    return (
        <li className={itemClassName}>
            <a
                href="#"
                className="slds-context-bar__label-action"
                title="さらに表示"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={(event) => {
                    event.preventDefault();
                    onToggle();
                }}
            >
                {active ? <span className="slds-assistive-text">Current Page:</span> : null}
                <span className="slds-truncate" title="さらに表示">
                    さらに表示
                </span>
            </a>
            <div className="slds-context-bar__icon-action slds-p-left_none">
                <button className="slds-button slds-button_icon slds-context-bar__button" type="button" aria-haspopup="true" title="さらに表示メニューを開く" onClick={onToggle}>
                    <UtilityIcon className="slds-button__icon slds-button__icon_small" name="down" />
                    <span className="slds-assistive-text">さらに表示メニューを開く</span>
                </button>
            </div>
            <div className="slds-dropdown slds-dropdown_right">
                <ul className="slds-dropdown__list" role="menu" aria-label="さらに表示">
                    {items.map((item) => (
                        <li className="slds-dropdown__item" role="presentation" key={item.tab}>
                            <a
                                href="#"
                                role="menuitem"
                                tabIndex={open ? 0 : -1}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onSelect(item.tab);
                                }}
                            >
                                <span title={item.label}>
                                    {item.tab === selectedTab ? <UtilityIcon className="slds-icon slds-icon_x-small slds-icon-text-default slds-m-right_x-small" name="check" /> : null}
                                    {item.label}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
}

export function StandardPageHeaderIcon({ tab, label }: { tab: ActiveTab; label: string }) {
    const iconClass =
        tab === "home"
            ? "slds-icon-standard-home"
            : tab === "accounts"
                ? "slds-icon-standard-account"
                : tab === "contacts"
                    ? "slds-icon-standard-contact"
                    : tab === "activities"
                        ? "slds-icon-standard-task"
                        : tab === "recycleBin"
                            ? "slds-icon-standard-empty"
                            : "slds-icon-standard-connected-apps";

    return (
        <span className={`slds-icon_container ${iconClass}`} title={label}>
            <StandardIcon
                className="slds-icon slds-page-header__icon"
                name={getStandardIconName(tab)}
            />
            <span className="slds-assistive-text">{label}</span>
        </span>
    );
}

export function UtilityButtonIcon({ name, label }: { name: UtilityIconName; label: string }) {
    return <UtilityIcon className="slds-button__icon" name={name} />;
}
