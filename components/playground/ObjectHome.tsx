import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";
import type { AccountForm } from "@/lib/salesforce/records";
import { AccountFormFields } from "./Forms";
import type { ActiveTab } from "./types";
import type { FormEvent, ReactNode } from "react";

export function ObjectHomeHeader({
    activeTab,
    loading,
    onCreate,
    onRefresh
}: {
    activeTab: "accounts" | "contacts";
    loading: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    const objectLabel = activeTab === "accounts" ? "取引先" : "取引先責任者";

    return (
        <PageHeader
            tab={activeTab}
            eyebrow={objectLabel}
            title="レコード一覧"
            className="slds-page-header_object-home slds-page-header_joined"
            actions={
                <>
                    <PageHeaderControl>
                        <RefreshButton loading={loading} onRefresh={onRefresh} />
                    </PageHeaderControl>
                    <PageHeaderControl>
                        <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={onCreate}>
                            新規{objectLabel}
                        </button>
                    </PageHeaderControl>
                </>
            }
        />
    );
}

export function IntegrationPanel({
    accountForm,
    loading,
    saving,
    onAccountFormChange,
    onCreateAccount,
    onRefresh
}: {
    accountForm: AccountForm;
    loading: boolean;
    saving: boolean;
    onAccountFormChange: (value: AccountForm) => void;
    onCreateAccount: (event: FormEvent<HTMLFormElement>) => void;
    onRefresh: () => void;
}) {
    return (
        <>
            <PageHeader
                tab="integration"
                eyebrow="連携"
                title="連携ユーザーによる取引先作成"
                metaText="Client Credentials Flow で取引先レコードを作成します。"
                actions={
                    <PageHeaderControl>
                        <RefreshButton loading={loading} onRefresh={onRefresh} />
                    </PageHeaderControl>
                }
            />

            <div className="slds-m-top_small">
                <form className="slds-box slds-theme_default" onSubmit={onCreateAccount}>
                    <div className="slds-text-heading_small slds-m-bottom_medium">新規取引先</div>
                    <AccountFormFields value={accountForm} onChange={onAccountFormChange} />
                    <div className="slds-m-top_medium slds-text-align_right">
                        <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                            {saving ? "作成中..." : "取引先を作成"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export function HomePanel({
    accountsCount,
    contactsCount,
    connected,
    instanceUrl,
    loading,
    onRefresh
}: {
    accountsCount: number;
    contactsCount: number;
    connected: boolean;
    instanceUrl?: string;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <>
            <PageHeader
                tab="home"
                eyebrow="ホーム"
                title="Salesforce API Playground"
                metaText="OAuth と REST API で取引先 / 取引先責任者を直接操作する学習アプリ"
                actions={
                    <PageHeaderControl>
                        <RefreshButton loading={loading} onRefresh={onRefresh} />
                    </PageHeaderControl>
                }
            />

            <div className="slds-p-around_medium">
                <div className="slds-grid slds-wrap slds-gutters">
                    <StatusSummary label="接続" value={connected ? "接続済み" : "未接続"} tone={connected ? "success" : "default"} />
                    <StatusSummary label="取引先" value={String(accountsCount)} />
                    <StatusSummary label="取引先責任者" value={String(contactsCount)} />
                    <StatusSummary label="インスタンス" value={connected ? instanceUrl ?? "-" : "OAuth が必要です"} />
                </div>
            </div>
        </>
    );
}

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

function StatusSummary({
    label,
    value,
    tone = "default"
}: {
    label: string;
    value: string;
    tone?: "default" | "success";
}) {
    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
            <article className={`slds-tile slds-box slds-box_x-small ${tone === "success" ? "slds-theme_success" : "slds-theme_default"}`}>
                <h2 className="slds-tile__title slds-truncate" title={label}>
                    {label}
                </h2>
                <div className="slds-tile__detail">
                    <p className="slds-truncate" title={value}>
                        {value}
                    </p>
                </div>
            </article>
        </div>
    );
}
