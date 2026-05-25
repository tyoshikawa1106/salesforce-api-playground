import Image from "next/image";
import type { ActiveTab } from "./types";
import { standardIcons, utilityIcons } from "./icons";

export function AppNavigation({
    activeTab,
    connected,
    onChange
}: {
    activeTab: ActiveTab;
    connected: boolean;
    onChange: (tab: ActiveTab) => void;
}) {
    return (
        <div className="slds-context-bar heroku-context-bar">
            <div className="slds-context-bar__primary">
                <div className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click slds-no-hover">
                    <div className="slds-context-bar__icon-action">
                        <button className="slds-button slds-icon-waffle_container slds-context-bar__button" type="button" title="Open App Launcher">
                            <AppLauncherIcon />
                            <span className="slds-assistive-text">Open App Launcher</span>
                        </button>
                    </div>
                    <span className="slds-context-bar__label-action slds-context-bar__app-name">
                        <span className="slds-truncate" title="Heroku">
                            Heroku
                        </span>
                    </span>
                </div>
            </div>
            <nav className="slds-context-bar__secondary" aria-label="Primary">
                <ul className="slds-grid">
                    <NavigationItem active={activeTab === "home"} label="Home" onClick={() => onChange("home")} />
                    {connected ? <NavigationItem active={activeTab === "accounts"} label="Accounts" onClick={() => onChange("accounts")} /> : null}
                    {connected ? <NavigationItem active={activeTab === "contacts"} label="Contacts" onClick={() => onChange("contacts")} /> : null}
                </ul>
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

function NavigationItem({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <li className={`slds-context-bar__item ${active ? "slds-is-active heroku-context-bar__item_active" : ""}`}>
            <button
                className={`slds-button_reset slds-context-bar__label-action ${active ? "heroku-context-bar__label-action_active" : ""}`}
                type="button"
                onClick={onClick}
            >
                <span className="slds-truncate" title={label}>
                    {label}
                </span>
            </button>
        </li>
    );
}

export function StandardPageHeaderIcon({ tab, label }: { tab: ActiveTab; label: string }) {
    const iconClass =
        tab === "home" ? "slds-icon-standard-home" : tab === "accounts" ? "slds-icon-standard-account" : "slds-icon-standard-contact";

    return (
        <span className={`slds-icon_container playground-page-header-icon ${iconClass}`} title={label}>
            <Image className="slds-icon slds-page-header__icon playground-page-header-icon__image" src={standardIcons[tab]} alt="" width={36} height={36} aria-hidden="true" />
            <span className="slds-assistive-text">{label}</span>
        </span>
    );
}

export function UtilityButtonIcon({ name, label }: { name: keyof typeof utilityIcons; label: string }) {
    return <Image className="slds-button__icon" src={utilityIcons[name]} alt={label} width={16} height={16} />;
}
