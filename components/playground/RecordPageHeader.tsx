import type { ReactNode } from "react";
import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";

export function DetailBlock({ label, value }: { label: string; value: string }) {
    return (
        <li className="slds-page-header__detail-block slds-size_1-of-1 slds-small-size_1-of-2 slds-large-size_1-of-5 playground-record-detail-block">
            <p className="slds-text-title slds-truncate" title={label}>
                {label}
            </p>
            <p className="slds-truncate" title={value}>
                {value}
            </p>
        </li>
    );
}

export function RecordPageHeader({
    tab,
    objectLabel,
    title,
    loading,
    onDelete,
    onEdit,
    onRefresh,
    children
}: {
    tab: "accounts" | "contacts";
    objectLabel: string;
    title: string;
    loading: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onRefresh: () => void;
    children: ReactNode;
}) {
    return (
        <div className="slds-page-header slds-page-header_record-home slds-page-header_joined playground-record-header">
            <div className="slds-page-header__row playground-record-header-row">
                <div className="slds-page-header__col-title playground-record-header-title">
                    <div className="slds-media">
                        <div className="slds-media__figure">
                            <StandardPageHeaderIcon tab={tab} label={objectLabel} />
                        </div>
                        <div className="slds-media__body">
                            <div className="slds-page-header__name">
                                <div className="slds-page-header__name-title">
                                    <p className="slds-text-title_caps">{objectLabel}</p>
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
                <div className="slds-page-header__col-actions slds-max-medium-size_full playground-record-header-actions">
                    <div className="slds-page-header__controls playground-record-header-controls">
                        <div className="slds-page-header__control playground-record-header-action">
                            <button
                                className="slds-button slds-button_icon slds-button_icon-border-filled playground-record-header-button"
                                type="button"
                                title="更新"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <UtilityButtonIcon name="refresh" label="" />
                                <span className="slds-assistive-text">更新</span>
                            </button>
                        </div>
                        <div className="slds-page-header__control playground-record-header-action">
                            <div className="slds-button-group" role="group" aria-label={`${objectLabel}レコードのアクション`}>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch playground-record-header-button" type="button" onClick={onEdit}>
                                    編集
                                </button>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch playground-record-header-button" type="button" onClick={onDelete}>
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row slds-page-header__row_gutters playground-record-header-row">
                <div className="slds-page-header__col-details">
                    <ul className="slds-page-header__detail-row playground-record-detail-row">{children}</ul>
                </div>
            </div>
        </div>
    );
}
