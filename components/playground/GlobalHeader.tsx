"use client";

import type { ReactNode } from "react";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { GlobalHeaderActions } from "./GlobalHeaderActions";
import { GlobalSearch } from "./GlobalSearch";
import { useGlobalHeaderMenus } from "./useGlobalHeaderMenus";

type GlobalHeaderProps = {
    children?: ReactNode;
    connected: boolean;
    instanceUrl?: string;
    onCreateEvent?: () => void;
    onCreateTask?: () => void;
    userName?: string;
    onSelectSearchResult?: (result: SearchResultItem) => void;
};

export function GlobalHeader({ children, connected, instanceUrl, onCreateEvent, onCreateTask, userName, onSelectSearchResult }: GlobalHeaderProps) {
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
        <header ref={headerRef} className="slds-global-header_container" onKeyDown={closeOnEscape}>
            <div className="slds-global-header slds-grid slds-grid_align-spread">
                <div className="slds-global-header__item">
                    <div className="slds-global-header__logo">
                        <span className="slds-assistive-text">Salesforce</span>
                    </div>
                </div>
                <div className="slds-global-header__item slds-global-header__item_search">
                    <GlobalSearch connected={connected} onSelectSearchResult={onSelectSearchResult} />
                </div>
                <div className="slds-global-header__item">
                    {connected ? (
                        <GlobalHeaderActions
                            activeActionPopover={activeActionPopover}
                            cancelActionPopoverClose={cancelActionPopoverClose}
                            cancelProfileMenuClose={cancelProfileMenuClose}
                            instanceUrl={instanceUrl}
                            onCreateEvent={onCreateEvent}
                            onCreateTask={onCreateTask}
                            profileMenuOpen={profileMenuOpen}
                            scheduleActionPopoverClose={scheduleActionPopoverClose}
                            scheduleProfileMenuClose={scheduleProfileMenuClose}
                            showNotificationBadge={showNotificationBadge}
                            toggleActionPopover={toggleActionPopover}
                            toggleNotificationBadge={toggleNotificationBadge}
                            toggleProfileMenu={toggleProfileMenu}
                            userName={userName}
                        />
                    ) : (
                        <a className="slds-button slds-button_brand heroku-brand-action" href="/api/auth/login">
                            Salesforce に接続
                        </a>
                    )}
                </div>
            </div>
            {children}
        </header>
    );
}
