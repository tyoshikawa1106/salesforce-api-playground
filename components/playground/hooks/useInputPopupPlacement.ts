"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type PopupBoundary = Pick<Node, "contains"> | null;
type InputPopupPlacementOptions = {
    constrainHeight?: boolean;
};

const inputPopupVisibleOptionCount = 5;
const inputPopupMinimumVisibleHeight = 80;

export function isInputPopupTargetWithin(target: EventTarget | null, container: PopupBoundary, popup: PopupBoundary) {
    if (!target) {
        return false;
    }

    const targetNode = target as Node;

    return Boolean(container?.contains(targetNode) || popup?.contains(targetNode));
}

export function shouldCloseInputPopupOnBlur(relatedTarget: EventTarget | null, container: PopupBoundary, popup: PopupBoundary) {
    return !isInputPopupTargetWithin(relatedTarget, container, popup);
}

export function clampInputPopupLeft({
    containerLeft,
    popupWidth,
    viewportWidth
}: {
    containerLeft: number;
    popupWidth: number;
    viewportWidth: number;
}) {
    const viewportMargin = 8;
    const maxLeft = Math.max(viewportMargin, viewportWidth - popupWidth - viewportMargin);

    return Math.min(Math.max(viewportMargin, containerLeft), maxLeft);
}

export function isListboxInputPopup(popup: Element) {
    return popup.classList.contains("slds-listbox") || Boolean(popup.querySelector(".slds-listbox"));
}

export function getInputPopupVisibleOptionsHeight(popup: Element) {
    const listbox = popup.classList.contains("slds-listbox") ? popup : popup.querySelector(".slds-listbox");

    if (!listbox) {
        return undefined;
    }

    const optionElements = Array.from(listbox.children)
        .filter((element) => (
            element.classList.contains("slds-listbox__item")
            || element.getAttribute("role") === "option"
        ))
        .slice(0, inputPopupVisibleOptionCount);

    if (optionElements.length === 0) {
        return undefined;
    }

    return optionElements.reduce((total, element) => total + element.getBoundingClientRect().height, 0);
}

export function shouldOpenInputPopupAbove({
    spaceAbove,
    spaceBelow
}: {
    spaceAbove: number;
    spaceBelow: number;
}) {
    return spaceBelow < inputPopupMinimumVisibleHeight && spaceAbove > spaceBelow;
}

export function useInputPopupPlacement(open: boolean, { constrainHeight = true }: InputPopupPlacementOptions = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [openAbove, setOpenAbove] = useState(false);
    const [popupStyle, setPopupStyle] = useState<CSSProperties>({
        position: "fixed",
        visibility: "hidden"
    });
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    useLayoutEffect(() => {
        if (!open) {
            setOpenAbove(false);
            setPopupStyle({
                position: "fixed",
                visibility: "hidden"
            });
            return;
        }

        const container = containerRef.current;
        const popup = popupRef.current;

        if (!container || !popup) {
            return;
        }

        const measuredContainer = container;
        const measuredPopup = popup;
        const scrollContainer = measuredContainer.closest(".slds-scrollable_y");

        function updatePlacement() {
            const containerRect = measuredContainer.getBoundingClientRect();
            const popupRect = measuredPopup.getBoundingClientRect();
            const lowerBoundary = window.innerHeight - 8;
            const popupHeight = Math.max(popupRect.height, measuredPopup.scrollHeight);
            const spaceBelow = lowerBoundary - containerRect.bottom - 4;
            const spaceAbove = containerRect.top - 12;
            const nextOpenAbove = shouldOpenInputPopupAbove({ spaceAbove, spaceBelow });
            const availableHeight = Math.max(inputPopupMinimumVisibleHeight, nextOpenAbove ? spaceAbove : spaceBelow);
            const isListboxPopup = isListboxInputPopup(measuredPopup);
            const visibleOptionsHeight = getInputPopupVisibleOptionsHeight(measuredPopup);
            const constrainedMaxHeight = Math.min(
                availableHeight,
                visibleOptionsHeight ?? popupHeight
            );
            const maxHeight = constrainHeight ? constrainedMaxHeight : popupHeight;
            const height = Math.min(popupHeight, maxHeight);
            const measuredPopupWidth = Math.max(popupRect.width, measuredPopup.scrollWidth);
            const popupWidth = isListboxPopup
                ? Math.min(containerRect.width, window.innerWidth - 16)
                : Math.min(
                    Math.max(containerRect.width, measuredPopupWidth),
                    window.innerWidth - 16
                );

            setOpenAbove(nextOpenAbove);
            setPopupStyle({
                left: clampInputPopupLeft({
                    containerLeft: containerRect.left,
                    popupWidth,
                    viewportWidth: window.innerWidth
                }),
                maxHeight: constrainHeight ? maxHeight : undefined,
                maxWidth: isListboxPopup ? popupWidth : undefined,
                minWidth: isListboxPopup ? popupWidth : undefined,
                overflowY: constrainHeight ? "auto" : undefined,
                position: "fixed",
                top: nextOpenAbove ? Math.max(8, containerRect.top - height - 4) : containerRect.bottom + 4,
                visibility: "visible",
                width: popupWidth,
                zIndex: "var(--playground-input-popup-z-index)"
            });
        }

        updatePlacement();
        window.addEventListener("resize", updatePlacement);
        scrollContainer?.addEventListener("scroll", updatePlacement, { passive: true });
        const resizeObserver = new ResizeObserver(updatePlacement);
        resizeObserver.observe(measuredContainer);
        resizeObserver.observe(measuredPopup);
        const mutationObserver = new MutationObserver(updatePlacement);
        mutationObserver.observe(measuredPopup, {
            childList: true,
            subtree: true
        });

        return () => {
            window.removeEventListener("resize", updatePlacement);
            scrollContainer?.removeEventListener("scroll", updatePlacement);
            mutationObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, [constrainHeight, open, portalTarget]);

    const isTargetWithinPopup = useCallback((target: EventTarget | null) => (
        isInputPopupTargetWithin(target, containerRef.current, popupRef.current)
    ), []);

    const shouldCloseOnBlur = useCallback((relatedTarget: EventTarget | null) => (
        shouldCloseInputPopupOnBlur(relatedTarget, containerRef.current, popupRef.current)
    ), []);

    return {
        containerRef,
        isTargetWithinPopup,
        popupClassName: openAbove ? " playground-input-popup_above" : "",
        popupRef,
        popupStyle,
        portalTarget,
        shouldCloseOnBlur
    };
}
