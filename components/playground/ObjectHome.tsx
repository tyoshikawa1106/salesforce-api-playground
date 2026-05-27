import { StandardPageHeaderIcon } from "./Navigation";
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
    const objectLabel = activeTab === "accounts" ? "Account" : "Contact";
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
                                        <span className="slds-page-header__title slds-truncate" title="Recently Viewed">
                                            Recently Viewed
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <p className="slds-page-header__name-meta">
                                {recordCount} {recordCount === 1 ? "item" : "items"} - Updated just now
                            </p>
                        </div>
                    </div>
                </div>
                <div className="slds-page-header__col-actions">
                    <div className="slds-page-header__controls">
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                Refresh
                            </button>
                        </div>
                        <div className="slds-page-header__control">
                            <button className="slds-button slds-button_brand heroku-brand-action" type="button" onClick={onCreate}>
                                New {objectLabel}
                            </button>
                        </div>
                    </div>
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
                                <StandardPageHeaderIcon tab="integration" label="Integration" />
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <p className="slds-text-title_caps">Integration</p>
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Integration User Account Create">
                                                Integration User Account Create
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                                <p className="slds-page-header__name-meta">Create Account records with Client Credentials Flow.</p>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            <div className="slds-page-header__control">
                                <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="slds-p-around_medium">
                <form className="slds-box slds-theme_default" onSubmit={onCreateAccount}>
                    <div className="slds-text-heading_small slds-m-bottom_medium">New Account</div>
                    <AccountFormFields value={accountForm} onChange={onAccountFormChange} />
                    <div className="slds-m-top_medium slds-text-align_right">
                        <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                            {saving ? "Creating..." : "Create Account"}
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
                                <StandardPageHeaderIcon tab="home" label="Home" />
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <p className="slds-text-title_caps">App</p>
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Salesforce API Playground">
                                                Salesforce API Playground
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                                <p className="slds-page-header__name-meta">OAuth と REST API で Account / Contact を直接操作する学習アプリ</p>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            <div className="slds-page-header__control">
                                <button className="slds-button slds-button_neutral" type="button" onClick={onRefresh} disabled={loading}>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="slds-p-around_medium">
                <div className="slds-grid slds-wrap slds-gutters">
                    <StatusSummary label="Connection" value={connected ? "Connected" : "Not connected"} tone={connected ? "success" : "default"} />
                    <StatusSummary label="Accounts" value={String(accountsCount)} />
                    <StatusSummary label="Contacts" value={String(contactsCount)} />
                    <StatusSummary label="Instance" value={connected ? instanceUrl ?? "-" : "OAuth required"} />
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
