"use client";

import { useEffect } from "react";

const visualViewportBottomOffsetProperty = "--playground-visual-viewport-bottom-offset";
const visualViewportHeightProperty = "--playground-visual-viewport-height";
const focusedInputBottomOffsetProperty = "--playground-focused-input-bottom-offset";
const mobileViewportQuery = "(max-width: 47.99em)";

export function calculateVisualViewportBottomOffset({
    height,
    innerHeight,
    offsetTop
}: {
    height: number;
    innerHeight: number;
    offsetTop: number;
}) {
    return Math.max(0, innerHeight - height - offsetTop);
}

export function isKeyboardEditableElement(target: EventTarget | null) {
    if (typeof HTMLElement === "undefined") {
        return false;
    }

    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return target.isContentEditable || target.matches("input, textarea, select");
}

export function useVisualViewportBottomOffset() {
    useEffect(() => {
        const visualViewport = window.visualViewport;
        const mobileViewport = window.matchMedia(mobileViewportQuery);

        if (!visualViewport) {
            return;
        }

        const viewport = visualViewport;

        function updateFocusedInputOffset() {
            const activeElement = document.activeElement;
            const composerHasFocusedInput = Boolean(
                mobileViewport.matches
                && isKeyboardEditableElement(activeElement)
                && activeElement?.closest(".playground-task-composer")
            );

            document.documentElement.style.setProperty(
                focusedInputBottomOffsetProperty,
                composerHasFocusedInput ? "4.75rem" : "0px"
            );
        }

        function updateBottomOffset() {
            const bottomOffset = calculateVisualViewportBottomOffset({
                height: viewport.height,
                innerHeight: window.innerHeight,
                offsetTop: viewport.offsetTop
            });
            document.documentElement.style.setProperty(visualViewportBottomOffsetProperty, `${bottomOffset}px`);
            document.documentElement.style.setProperty(visualViewportHeightProperty, `${viewport.height}px`);
            updateFocusedInputOffset();
        }

        function scheduleBottomOffsetUpdate() {
            updateBottomOffset();
            window.setTimeout(updateBottomOffset, 80);
        }

        updateBottomOffset();
        viewport.addEventListener("resize", updateBottomOffset);
        viewport.addEventListener("scroll", updateBottomOffset);
        window.addEventListener("focusin", scheduleBottomOffsetUpdate);
        window.addEventListener("focusout", scheduleBottomOffsetUpdate);
        mobileViewport.addEventListener("change", updateBottomOffset);

        return () => {
            viewport.removeEventListener("resize", updateBottomOffset);
            viewport.removeEventListener("scroll", updateBottomOffset);
            window.removeEventListener("focusin", scheduleBottomOffsetUpdate);
            window.removeEventListener("focusout", scheduleBottomOffsetUpdate);
            mobileViewport.removeEventListener("change", updateBottomOffset);
            document.documentElement.style.removeProperty(visualViewportBottomOffsetProperty);
            document.documentElement.style.removeProperty(visualViewportHeightProperty);
            document.documentElement.style.removeProperty(focusedInputBottomOffsetProperty);
        };
    }, []);
}
