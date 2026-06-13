import { describe, expect, it } from "vitest";
import type { AccountForm } from "@/lib/salesforce/records";
import type { PicklistValuesResponse } from "@/lib/salesforce/picklist-values";
import { getDefaultTaskForm } from "../activities/activity-task-form";
import { buildPlaygroundPicklistState } from "./usePlaygroundPicklists";

const blankAccountForm: AccountForm = {
    BillingCity: "",
    BillingCountry: "",
    Industry: "",
    Name: "",
    Phone: "",
    Type: "",
    Website: ""
};

const accountPicklists: PicklistValuesResponse = {
    fields: {
        Industry: [
            { label: "Technology", value: "Technology" }
        ],
        Type: [
            { label: "Customer", value: "Customer" }
        ]
    }
};

const taskPicklists: PicklistValuesResponse = {
    fields: {
        Status: [
            { label: "Not Started", value: "Not Started" }
        ]
    }
};

describe("buildPlaygroundPicklistState", () => {
    it("builds modal, integration, and task status options while preserving current values", () => {
        const state = buildPlaygroundPicklistState({
            accountForm: {
                ...blankAccountForm,
                Industry: "Legacy Industry",
                Type: "Customer"
            },
            accountModalPicklists: {
                data: accountPicklists,
                error: "modal error",
                loading: true
            },
            integrationAccountForm: {
                ...blankAccountForm,
                Industry: "Technology",
                Type: "Legacy Type"
            },
            integrationAccountPicklists: {
                data: accountPicklists,
                error: "",
                loading: false
            },
            taskForm: {
                ...getDefaultTaskForm(),
                Status: "Waiting"
            },
            taskStatusPicklists: {
                data: taskPicklists,
                error: "",
                loading: false
            }
        });

        expect(state.accountModalPicklists).toEqual({
            error: "modal error",
            loading: true,
            options: {
                Industry: [
                    { label: "Technology", value: "Technology" },
                    { label: "Legacy Industry", value: "Legacy Industry" }
                ],
                Type: [
                    { label: "Customer", value: "Customer" }
                ]
            }
        });
        expect(state.integrationAccountPicklists.options.Type).toEqual([
            { label: "Customer", value: "Customer" },
            { label: "Legacy Type", value: "Legacy Type" }
        ]);
        expect(state.taskStatusOptions).toEqual([
            { label: "Not Started", value: "Not Started" },
            { label: "Waiting", value: "Waiting" }
        ]);
    });

    it("omits task status options when Salesforce returned no options and there is no current value", () => {
        const state = buildPlaygroundPicklistState({
            accountForm: blankAccountForm,
            accountModalPicklists: {
                data: null,
                error: "",
                loading: false
            },
            integrationAccountForm: blankAccountForm,
            integrationAccountPicklists: {
                data: null,
                error: "",
                loading: false
            },
            taskForm: {
                ...getDefaultTaskForm(),
                Status: ""
            },
            taskStatusPicklists: {
                data: { fields: { Status: [] } },
                error: "",
                loading: false
            }
        });

        expect(state.taskStatusOptions).toBeUndefined();
    });
});
