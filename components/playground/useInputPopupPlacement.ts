"use client";

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";

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
            const footer = measuredContainer.closest(".playground-task-composer, .slds-modal__container")?.querySelector(".playground-task-composer__footer, .playground-activity-modal-footer");
            const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
            const lowerBoundary = Math.min(window.innerHeight - 8, footerTop - 4);
            const popupHeight = Math.max(popupRect.height, measuredPopup.scrollHeight);
            const spaceBelow = lowerBoundary - containerRect.bottom - 4;
            const spaceAbove = containerRect.top - 12;
            const nextOpenAbove = popupHeight > spaceBelow && spaceAbove > spaceBelow;
            const availableHeight = Math.max(80, nextOpenAbove ? spaceAbove : spaceBelow);
            const height = Math.min(popupHeight, availableHeight);

            setOpenAbove(nextOpenAbove);
            setPopupStyle({
                left: containerRect.left,
                maxHeight: availableHeight,
                overflowY: "auto",
                position: "fixed",
                top: nextOpenAbove ? Math.max(8, containerRect.top - height - 4) : containerRect.bottom + 4,
                visibility: "visible",
                width: containerRect.width,
                zIndex: 7200
            });
        }

        updatePlacement();
        window.addEventListener("resize", updatePlacement);
        scrollContainer?.addEventListener("scroll", updatePlacement, { passive: true });

        return () => {
            window.removeEventListener("resize", updatePlacement);
            scrollContainer?.removeEventListener("scroll", updatePlacement);
        };
    }, [open, portalTarget]);

    return {
        containerRef,
        popupClassName: openAbove ? " playground-input-popup_above" : "",
        popupRef,
        popupStyle,
        portalTarget
    };
}
