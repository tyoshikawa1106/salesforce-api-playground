import { PageHeader, PageHeaderControl, RefreshButton } from "./PageHeader";

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
            title="一覧"
            className="slds-page-header_object-home slds-page-header_joined"
            actions={
                <>
                    <PageHeaderControl>
                        <RefreshButton loading={loading} onRefresh={onRefresh} />
                    </PageHeaderControl>
                    <PageHeaderControl>
                        <button className="slds-button slds-button_neutral" type="button" onClick={onCreate}>
                            新規
                        </button>
                    </PageHeaderControl>
                </>
            }
        />
    );
}
