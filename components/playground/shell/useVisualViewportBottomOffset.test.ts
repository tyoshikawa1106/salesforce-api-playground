import { describe, expect, it } from "vitest";
import {
    calculateVisualViewportBottomOffset,
    isKeyboardEditableElement
} from "./useVisualViewportBottomOffset";

describe("calculateVisualViewportBottomOffset", () => {
    it("returns the covered bottom area when the visual viewport shrinks", () => {
        expect(calculateVisualViewportBottomOffset({
            height: 520,
            innerHeight: 844,
            offsetTop: 0
        })).toBe(324);
    });

    it("keeps the offset at zero when the visual viewport fills the layout viewport", () => {
        expect(calculateVisualViewportBottomOffset({
            height: 844,
            innerHeight: 844,
            offsetTop: 0
        })).toBe(0);
    });

    it("does not return a negative offset when browser chrome shifts the visual viewport", () => {
        expect(calculateVisualViewportBottomOffset({
            height: 844,
            innerHeight: 844,
            offsetTop: 24
        })).toBe(0);
    });

    it("treats missing or non-DOM targets as not keyboard editable", () => {
        expect(isKeyboardEditableElement(new EventTarget())).toBe(false);
        expect(isKeyboardEditableElement(null)).toBe(false);
    });
});
