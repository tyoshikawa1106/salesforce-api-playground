import { PageHeader, PageHeaderControl } from "../shell/PageHeader";

export function ObjectHomeHeader({
    activeTab,
    loading = false,
    onCreate
}: {
    activeTab: "accounts" | "contacts";
    loading?: boolean;
    onCreate: () => void;
}) {
    const objectLabel = activeTab === "accounts" ? "取引先" : "取引先責任者";

    return (
        <PageHeader
            tab={activeTab}
            eyebrow={objectLabel}
            title="最近参照したデータ"
            className="slds-page-header_object-home slds-page-header_joined"
            actions={
                <PageHeaderControl>
                    <button className="slds-button slds-button_neutral" type="button" onClick={onCreate} disabled={loading}>
                        新規
                    </button>
                </PageHeaderControl>
            }
        />
    );
}
