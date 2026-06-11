import { PageHeader } from "./PageHeader";

export function HomePanel({
    connected,
    instanceUrl
}: {
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
                <div className="slds-grid slds-wrap slds-gutters playground-home-status-grid">
                    <StatusSummary
                        label="接続"
                        value={connected ? "接続済み" : "未接続"}
                        tone={connected ? "success" : "default"}
                        widthClassName="slds-large-size_1-of-3"
                    />
                    <StatusSummary
                        label="インスタンス"
                        value={connected ? instanceUrl ?? "-" : "OAuth が必要です"}
                        widthClassName="slds-large-size_2-of-3"
                    />
                </div>
            </div>
        </>
    );
}

function StatusSummary({
    label,
    value,
    tone = "default",
    widthClassName
}: {
    label: string;
    value: string;
    tone?: "default" | "success";
    widthClassName: string;
}) {
    return (
        <div className={`slds-col slds-size_1-of-1 slds-medium-size_1-of-2 ${widthClassName}`}>
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
