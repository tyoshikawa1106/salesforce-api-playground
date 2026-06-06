import { PageHeader } from "./PageHeader";

export function HomePanel({
    accountsCount,
    contactsCount,
    connected,
    instanceUrl
}: {
    accountsCount: number;
    contactsCount: number;
    connected: boolean;
    instanceUrl?: string;
}) {
    return (
        <>
            <PageHeader
                tab="home"
                eyebrow="ホーム"
                title="Salesforce API Playground"
                metaText="Salesforce OAuth と REST API を試すための Next.js アプリ"
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
