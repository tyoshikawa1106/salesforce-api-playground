"use client";

import { useEffect } from "react";

const visualViewportBottomOffsetProperty = "--playground-visual-viewport-bottom-offset";
const visualViewportHeightProperty = "--playground-visual-viewport-height";

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

export function useVisualViewportBottomOffset() {
    useEffect(() => {
        const visualViewport = window.visualViewport;

        if (!visualViewport) {
            return;
        }

        const viewport = visualViewport;

        function updateBottomOffset() {
            const bottomOffset = calculateVisualViewportBottomOffset({
                height: viewport.height,
                innerHeight: window.innerHeight,
                offsetTop: viewport.offsetTop
            });
            document.documentElement.style.setProperty(visualViewportBottomOffsetProperty, `${bottomOffset}px`);
            document.documentElement.style.setProperty(visualViewportHeightProperty, `${viewport.height}px`);
        }

        updateBottomOffset();
        viewport.addEventListener("resize", updateBottomOffset);
        viewport.addEventListener("scroll", updateBottomOffset);

        return () => {
            viewport.removeEventListener("resize", updateBottomOffset);
            viewport.removeEventListener("scroll", updateBottomOffset);
            document.documentElement.style.removeProperty(visualViewportBottomOffsetProperty);
            document.documentElement.style.removeProperty(visualViewportHeightProperty);
        };
    }, []);
}
