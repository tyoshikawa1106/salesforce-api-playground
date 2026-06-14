"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type PopupBoundary = Pick<Node, "contains"> | null;

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

export function useInputPopupPlacement(open: boolean) {
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
            const footer = measuredContainer.closest(".playground-task-composer, .slds-modal__container")?.querySelector(".playground-task-composer__footer, .playground-activity-modal-footer, .slds-modal__footer");
            const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
            const lowerBoundary = Math.min(window.innerHeight - 8, footerTop - 4);
            const popupHeight = Math.max(popupRect.height, measuredPopup.scrollHeight);
            const spaceBelow = lowerBoundary - containerRect.bottom - 4;
            const spaceAbove = containerRect.top - 12;
            const nextOpenAbove = popupHeight > spaceBelow && spaceAbove > spaceBelow;
            const availableHeight = Math.max(80, nextOpenAbove ? spaceAbove : spaceBelow);
            const height = Math.min(popupHeight, availableHeight);
            const isListboxPopup = measuredPopup.classList.contains("slds-listbox");
            const measuredPopupWidth = isListboxPopup ? 192 : Math.max(popupRect.width, measuredPopup.scrollWidth);
            const popupWidth = Math.min(
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
                maxHeight: availableHeight,
                overflowY: "auto",
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

        return () => {
            window.removeEventListener("resize", updatePlacement);
            scrollContainer?.removeEventListener("scroll", updatePlacement);
            resizeObserver.disconnect();
        };
    }, [open, portalTarget]);

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
