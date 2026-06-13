import type { FormEvent } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { AccountFormFields } from "./Forms";
import { PageHeader, PageHeaderControl, RefreshButton } from "./PageHeader";
import type { PicklistOptionsByField } from "./picklist-options";

export function IntegrationPanel({
    accountForm,
    loading,
    picklistError = "",
    picklistLoading = false,
    picklistOptions,
    saving,
    onAccountFormChange,
    onCreateAccount,
    onRefresh
}: {
    accountForm: AccountForm;
    loading: boolean;
    picklistError?: string;
    picklistLoading?: boolean;
    picklistOptions?: PicklistOptionsByField<"Industry" | "Type">;
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
                <form className="slds-box slds-theme_default" onSubmit={onCreateAccount} noValidate>
                    <div className="slds-text-heading_small slds-m-bottom_medium">新規取引先</div>
                    <AccountFormFields
                        loadingPicklists={picklistLoading}
                        picklistError={picklistError}
                        picklistOptions={picklistOptions}
                        value={accountForm}
                        onChange={onAccountFormChange}
                    />
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
