import { describe, expect, it } from "vitest";
import {
    picklistOptionsForField,
    withCurrentPicklistOption,
    type PicklistOption
} from "./picklist-options";

const industryOptions: PicklistOption[] = [
    { label: "Technology", value: "Technology" },
    { label: "Finance", value: "Finance" }
];

describe("picklist option helpers", () => {
    it("keeps existing options when the current value is already present", () => {
        expect(withCurrentPicklistOption(industryOptions, "Technology")).toBe(industryOptions);
    });

    it("appends the current value when Salesforce options do not include it", () => {
        expect(withCurrentPicklistOption(industryOptions, "Legacy")).toEqual([
            ...industryOptions,
            { label: "Legacy", value: "Legacy" }
        ]);
    });

    it("reads field options from a picklist response before preserving the current value", () => {
        expect(
            picklistOptionsForField({
                fields: {
                    Industry: industryOptions
                }
            }, "Industry", "Legacy")
        ).toEqual([
            ...industryOptions,
            { label: "Legacy", value: "Legacy" }
        ]);
    });
});
