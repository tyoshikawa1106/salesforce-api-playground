import type { ReactNode } from "react";
import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";
import type { ActiveTab } from "./types";

export function PageHeader({
    tab,
    eyebrow,
    title,
    actions,
    metaText,
    className = "slds-page-header_joined"
}: {
    tab: ActiveTab;
    eyebrow: string;
    title: string;
    actions?: ReactNode;
    metaText?: string;
    className?: string;
}) {
    return (
        <div className={`slds-page-header ${className}`}>
            <div className="slds-page-header__row">
                <div className="slds-page-header__col-title">
                    <div className="slds-media">
                        <div className="slds-media__figure">
                            <StandardPageHeaderIcon tab={tab} label={eyebrow} />
                        </div>
                        <div className="slds-media__body">
                            <div className="slds-page-header__name">
                                <div className="slds-page-header__name-title">
                                    <p className="slds-text-title_caps">{eyebrow}</p>
                                    <h1>
                                        <span className="slds-page-header__title slds-truncate" title={title}>
                                            {title}
                                        </span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {actions ? (
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">{actions}</div>
                    </div>
                ) : null}
            </div>
            {metaText ? (
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-meta">
                        <p className="slds-page-header__meta-text">{metaText}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function PageHeaderControl({ children }: { children: ReactNode }) {
    return <div className="slds-page-header__control">{children}</div>;
}

export function RefreshButton({
    loading,
    onRefresh
}: {
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="更新" onClick={onRefresh} disabled={loading}>
            <UtilityButtonIcon name="refresh" label="" />
            <span className="slds-assistive-text">更新</span>
        </button>
    );
}
