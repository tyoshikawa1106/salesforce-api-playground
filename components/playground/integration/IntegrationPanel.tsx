import { type FormEvent, useEffect, useRef, useState } from "react";
import type { AccountForm } from "@/lib/salesforce/records";
import { AccountFormFields } from "../records/Forms";
import { PageHeader, PageHeaderControl, RefreshButton } from "../shell/PageHeader";
import type { PicklistOptionsByField } from "../utils/picklist-options";
import { accountTextFields, getRequiredFieldMessage } from "../records/record-forms";

export function shouldResetAccountCreateValidation({
    accountName,
    previousSaving,
    saving
}: {
    accountName: string;
    previousSaving: boolean;
    saving: boolean;
}) {
    return previousSaving && !saving && !accountName.trim();
}

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
    const [showValidation, setShowValidation] = useState(false);
    const previousSaving = useRef(saving);
    const fieldErrors = showValidation && !accountForm.Name.trim()
        ? { Name: getRequiredFieldMessage(accountTextFields, "Name") }
        : {};

    useEffect(() => {
        if (shouldResetAccountCreateValidation({
            accountName: accountForm.Name,
            previousSaving: previousSaving.current,
            saving
        })) {
            setShowValidation(false);
        }

        previousSaving.current = saving;
    }, [accountForm.Name, saving]);

    function createAccount(event: FormEvent<HTMLFormElement>) {
        setShowValidation(true);
        onCreateAccount(event);
    }

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
                <form className="slds-box slds-theme_default" onSubmit={createAccount} autoComplete="off" noValidate>
                    <div className="slds-text-heading_small slds-m-bottom_medium">新規取引先</div>
                    <AccountFormFields
                        fieldErrors={fieldErrors}
                        loadingPicklists={picklistLoading}
                        picklistError={picklistError}
                        picklistOptions={picklistOptions}
                        value={accountForm}
                        onChange={onAccountFormChange}
                    />
                    <div className="slds-m-top_medium slds-text-align_right">
                        <button className="slds-button slds-button_brand" type="submit" disabled={loading || saving}>
                            {saving ? "作成中..." : "取引先を作成"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
