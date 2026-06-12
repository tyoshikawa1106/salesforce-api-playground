import type { ReactNode } from "react";
import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";
import type { ActiveTab } from "./types";

export function DetailBlock({ label, value }: { label: string; value: ReactNode }) {
    const title = typeof value === "string" ? value : undefined;

    return (
        <li className="slds-page-header__detail-block slds-size_1-of-1 slds-small-size_1-of-2 slds-large-size_1-of-5 playground-record-detail-block">
            <p className="slds-text-title slds-truncate" title={label}>
                {label}
            </p>
            <p className="slds-truncate" title={title}>
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
    tab: ActiveTab;
    objectLabel: string;
    title: string;
    loading: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onRefresh: () => void;
    children: ReactNode;
}) {
    return (
        <div className="slds-page-header slds-page-header_record-home slds-page-header_joined">
            <div className="slds-page-header__row slds-wrap slds-grid_vertical-align-start">
                <div className="slds-page-header__col-title">
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
                <div className="slds-page-header__col-actions slds-max-medium-size_full">
                    <div className="slds-page-header__controls slds-wrap">
                        <div className="slds-page-header__control">
                            <button
                                className="slds-button slds-button_icon slds-button_icon-border-filled"
                                type="button"
                                title="更新"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <UtilityButtonIcon name="refresh" label="" />
                                <span className="slds-assistive-text">更新</span>
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <div className="slds-button-group" role="group" aria-label={`${objectLabel}レコードのアクション`}>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch" type="button" onClick={onEdit}>
                                    編集
                                </button>
                                <button className="slds-button slds-button_neutral slds-max-small-button_stretch" type="button" onClick={onDelete}>
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row slds-page-header__row_gutters">
                <div className="slds-page-header__col-details">
                    <ul className="slds-page-header__detail-row slds-wrap">{children}</ul>
                </div>
            </div>
        </div>
    );
}
