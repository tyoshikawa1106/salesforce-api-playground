import { describe, expect, it } from "vitest";
import {
    isInputPopupTargetWithin,
    shouldCloseInputPopupOnBlur
} from "./useInputPopupPlacement";

function createBoundary(containedTarget: EventTarget): Pick<Node, "contains"> {
    return {
        contains: (target) => target === containedTarget
    } as Pick<Node, "contains">;
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
});
