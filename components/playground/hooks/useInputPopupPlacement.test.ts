import { describe, expect, it } from "vitest";
import {
    clampInputPopupLeft,
    getInputPopupVisibleOptionsHeight,
    isListboxInputPopup,
    isInputPopupTargetWithin,
    shouldOpenInputPopupAbove,
    shouldCloseInputPopupOnBlur
} from "./useInputPopupPlacement";

function createBoundary(containedTarget: EventTarget): Pick<Node, "contains"> {
    return {
        contains: (target) => target === containedTarget
    } as Pick<Node, "contains">;
}

function createElementLike({
    children = [],
    classes = [],
    height = 0,
    role
}: {
    children?: Element[];
    classes?: string[];
    height?: number;
    role?: string;
}): Element {
    const element = {
        children,
        classList: {
            contains: (className: string) => classes.includes(className)
        },
        getAttribute: (name: string) => name === "role" ? role ?? null : null,
        getBoundingClientRect: () => ({ height }),
        querySelector: (selector: string) => {
            if (selector !== ".slds-listbox") {
                return null;
            }

            return children.find((child) => child.classList.contains("slds-listbox")) ?? null;
        }
    };

    return element as unknown as Element;
}

describe("input popup placement helpers", () => {
    it("keeps popup open when focus moves inside the trigger container", () => {
        const triggerTarget = new EventTarget();
        const container = createBoundary(triggerTarget);

        expect(isInputPopupTargetWithin(triggerTarget, container, null)).toBe(true);
        expect(shouldCloseInputPopupOnBlur(triggerTarget, container, null)).toBe(false);
    });

    it("keeps popup open when focus moves inside the portaled popup", () => {
        const popupTarget = new EventTarget();
        const popup = createBoundary(popupTarget);

        expect(isInputPopupTargetWithin(popupTarget, null, popup)).toBe(true);
        expect(shouldCloseInputPopupOnBlur(popupTarget, null, popup)).toBe(false);
    });

    it("closes popup when focus leaves both trigger and portaled popup", () => {
        const outsideTarget = new EventTarget();

        expect(isInputPopupTargetWithin(outsideTarget, null, null)).toBe(false);
        expect(shouldCloseInputPopupOnBlur(outsideTarget, null, null)).toBe(true);
        expect(shouldCloseInputPopupOnBlur(null, null, null)).toBe(true);
    });

    it("keeps fixed popups inside the viewport horizontally", () => {
        expect(clampInputPopupLeft({
            containerLeft: 405,
            popupWidth: 136,
            viewportWidth: 590
        })).toBe(405);

        expect(clampInputPopupLeft({
            containerLeft: 405,
            popupWidth: 220,
            viewportWidth: 590
        })).toBe(362);

        expect(clampInputPopupLeft({
            containerLeft: -12,
            popupWidth: 300,
            viewportWidth: 390
        })).toBe(8);
    });

    it("detects listbox popups even when the SLDS listbox is nested", () => {
        const nestedListbox = createElementLike({ classes: ["slds-listbox"] });
        const popup = createElementLike({ classes: ["slds-dropdown"], children: [nestedListbox] });

        expect(isListboxInputPopup(nestedListbox)).toBe(true);
        expect(isListboxInputPopup(popup)).toBe(true);
    });

    it("caps visible listbox height to five options", () => {
        const options = Array.from({ length: 8 }, () => createElementLike({
            classes: ["slds-listbox__item"],
            height: 32
        }));
        const popup = createElementLike({
            classes: ["slds-listbox"],
            children: options
        });

        expect(getInputPopupVisibleOptionsHeight(popup)).toBe(160);
    });

    it("keeps popups below by default even when the full list is taller than the available space", () => {
        expect(shouldOpenInputPopupAbove({
            spaceAbove: 360,
            spaceBelow: 120
        })).toBe(false);
    });

    it("moves popups above only when the lower space is too small to use", () => {
        expect(shouldOpenInputPopupAbove({
            spaceAbove: 360,
            spaceBelow: 48
        })).toBe(true);
    });
});
