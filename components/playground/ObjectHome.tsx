import { StandardPageHeaderIcon, UtilityButtonIcon } from "./Navigation";
import type { AccountForm } from "@/lib/salesforce/records";
import { AccountFormFields } from "./Forms";

export function ObjectHomeHeader({
    activeTab,
    accountsCount,
    contactsCount,
    loading,
    onCreate,
    onRefresh
}: {
    activeTab: "accounts" | "contacts";
    accountsCount: number;
    contactsCount: number;
    loading: boolean;
    onCreate: () => void;
    onRefresh: () => void;
}) {
    const objectLabel = activeTab === "accounts" ? "取引先" : "取引先責任者";
    const recordCount = activeTab === "accounts" ? accountsCount : contactsCount;

    return (
        <div className="slds-page-header slds-page-header_object-home slds-page-header_joined">
            <div className="slds-page-header__row">
                <div className="slds-page-header__col-title">
                    <div className="slds-media">
                        <div className="slds-media__figure">
                            <StandardPageHeaderIcon tab={activeTab} label={objectLabel} />
                        </div>
                        <div className="slds-media__body">
                            <div className="slds-page-header__name">
                                <div className="slds-page-header__name-title">
                                    <p className="slds-text-title_caps">{objectLabel}</p>
                                    <h1>
                                        <span className="slds-page-header__title slds-truncate" title="レコード一覧">
                                            レコード一覧
                                        </span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__col-actions">
                    <div className="slds-page-header__controls">
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="更新" onClick={onRefresh} disabled={loading}>
                                <UtilityButtonIcon name="refresh" label="" />
                                <span className="slds-assistive-text">更新</span>
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={onCreate}>
                                新規{objectLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slds-page-header__row">
                <div className="slds-page-header__col-meta">
                    <p className="slds-page-header__meta-text">
                        {recordCount} 件 - たった今更新
                    </p>
                </div>
            </div>
        </div>
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
    onCreateAccount: (event: React.FormEvent<HTMLFormElement>) => void;
    onRefresh: () => void;
}) {
    return (
        <>
            <div className="slds-page-header slds-page-header_joined">
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                        <div className="slds-media">
                            <div className="slds-media__figure">
                                <StandardPageHeaderIcon tab="integration" label="連携" />
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <p className="slds-text-title_caps">連携</p>
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="連携ユーザーによる取引先作成">
                                                連携ユーザーによる取引先作成
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            <div className="slds-page-header__control">
                                <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="更新" onClick={onRefresh} disabled={loading}>
                                    <UtilityButtonIcon name="refresh" label="" />
                                    <span className="slds-assistive-text">更新</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-meta">
                        <p className="slds-page-header__meta-text">Client Credentials Flow で取引先レコードを作成します。</p>
                    </div>
                </div>
            </div>

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
            <div className="slds-page-header slds-page-header_joined">
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                        <div className="slds-media">
                            <div className="slds-media__figure">
                                <StandardPageHeaderIcon tab="home" label="ホーム" />
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <p className="slds-text-title_caps">ホーム</p>
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Salesforce API Playground">
                                                Salesforce API Playground
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            <div className="slds-page-header__control">
                                <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="更新" onClick={onRefresh} disabled={loading}>
                                    <UtilityButtonIcon name="refresh" label="" />
                                    <span className="slds-assistive-text">更新</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-meta">
                        <p className="slds-page-header__meta-text">OAuth と REST API で取引先 / 取引先責任者を直接操作する学習アプリ</p>
                    </div>
                </div>
            </div>

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
