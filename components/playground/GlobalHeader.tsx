"use client";

import Image from "next/image";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { GlobalHeaderActions } from "./GlobalHeaderActions";
import { GlobalSearch } from "./GlobalSearch";
import { salesforceLogo } from "./icons";
import { useGlobalHeaderMenus } from "./useGlobalHeaderMenus";

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
                        <GlobalHeaderActions
                            activeActionPopover={activeActionPopover}
                            cancelActionPopoverClose={cancelActionPopoverClose}
                            cancelProfileMenuClose={cancelProfileMenuClose}
                            profileMenuOpen={profileMenuOpen}
                            scheduleActionPopoverClose={scheduleActionPopoverClose}
                            scheduleProfileMenuClose={scheduleProfileMenuClose}
                            showNotificationBadge={showNotificationBadge}
                            toggleActionPopover={toggleActionPopover}
                            toggleNotificationBadge={toggleNotificationBadge}
                            toggleProfileMenu={toggleProfileMenu}
                        />
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
