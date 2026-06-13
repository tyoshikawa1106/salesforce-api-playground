import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuickActionDateTimePicker, QuickActionSelect, QuickActionTextInput } from "./ActivityQuickActionFields";
import { QuickActionSubjectCombobox } from "./ActivitySubjectCombobox";
import { noop } from "../utils/test-fixtures";

describe("activity subject combobox smoke rendering", () => {
    it("renders caller-scoped ids without a closed listbox overlay", () => {
        const markup = renderToStaticMarkup(
            createElement(QuickActionSubjectCombobox, {
                idPrefix: "new-event-subject-combobox",
                label: "件名",
                onChange: noop,
                required: true,
                value: "Email"
            })
        );

        expect(markup).toContain("id=\"new-event-subject-combobox-input\"");
        expect(markup).toContain("aria-controls=\"new-event-subject-combobox-listbox\"");
        expect(markup).toContain("playground-input-popup-container");
        expect(markup).not.toContain("role=\"listbox\"");
    });

    it("renders form element help outside the control wrapper", () => {
        const markup = renderToStaticMarkup(
            createElement(QuickActionTextInput, {
                error: "件名は必須です。",
                label: "件名",
                onChange: noop,
                required: true,
                value: ""
            })
        );
        const controlEnd = markup.indexOf("</div><div class=\"slds-form-element__help\"");

        expect(markup).toContain("slds-form-element slds-size_1-of-1 slds-has-error");
        expect(markup).toContain("aria-describedby=\"activity-text-件名-error\"");
        expect(markup).toContain("id=\"activity-text-件名-error\"");
        expect(controlEnd).toBeGreaterThanOrEqual(0);
        expect(markup).toContain("件名は必須です。");
    });

    it("renders datetime input as an SLDS fieldset form element", () => {
        const markup = renderToStaticMarkup(
            createElement(QuickActionDateTimePicker, {
                error: "開始は必須です。",
                idPrefix: "event-start",
                label: "開始",
                onChange: noop,
                required: true,
                value: "2026-06-13T09:00"
            })
        );
        const legendStart = markup.indexOf("<legend class=\"slds-form-element__label\"");
        const controlStart = markup.indexOf("<div class=\"slds-form-element__control\">");
        const helpStart = markup.indexOf("<div class=\"slds-form-element__help\" id=\"event-start-error\">");

        expect(markup).toContain("<fieldset class=\"slds-form-element slds-size_1-of-1 slds-has-error\"");
        expect(markup).toContain("aria-describedby=\"event-start-error\"");
        expect(legendStart).toBeGreaterThanOrEqual(0);
        expect(controlStart).toBeGreaterThan(legendStart);
        expect(helpStart).toBeGreaterThan(controlStart);
    });

    it("renders picklist as an SLDS select-only combobox button", () => {
        const markup = renderToStaticMarkup(
            createElement(QuickActionSelect, {
                label: "状況",
                onChange: noop,
                required: true,
                value: "Not Started"
            })
        );

        expect(markup).toContain("role=\"combobox\"");
        expect(markup).toContain("type=\"button\"");
        expect(markup).toContain("slds-combobox__input slds-input_faux slds-combobox__input-value");
        expect(markup).not.toContain("<select");
        expect(markup).not.toContain("readonly");
    });
});
