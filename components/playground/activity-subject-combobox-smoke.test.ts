import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuickActionSubjectCombobox } from "./ActivitySubjectCombobox";
import { noop } from "./test-fixtures";

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
        expect(markup).not.toContain("role=\"listbox\"");
    });
});
