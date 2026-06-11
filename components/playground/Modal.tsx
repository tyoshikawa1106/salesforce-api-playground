"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
        const isHidden = element.hidden || element.getAttribute("aria-hidden") === "true" || element.offsetParent === null;
        return !isHidden;
    });
}

function getInitialFocusElement(container: HTMLElement): HTMLElement {
    const preferredElement = container.querySelector<HTMLElement>(
        "input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not(.slds-modal__close)"
    );

    return preferredElement ?? getFocusableElements(container)[0] ?? container;
}

function focusWithoutScrolling(element: HTMLElement | null): void {
    element?.focus({ preventScroll: true });
}

export function Modal({
    title,
    onClose,
    narrow,
    children
}: {
    title: string;
    onClose: () => void;
    narrow?: boolean;
    children: ReactNode;
}) {
    const titleId = useId();
    const modalRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const modalElement = modalRef.current;
        const previousBodyOverflow = document.body.style.overflow;

        if (modalElement) {
            focusWithoutScrolling(getInitialFocusElement(modalElement));
        }

        document.body.style.overflow = "hidden";

        function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        }

        document.addEventListener("keydown", handleDocumentKeyDown);

        return () => {
            document.removeEventListener("keydown", handleDocumentKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            focusWithoutScrolling(activeElement);
        };
    }, [onClose]);

    function handleModalKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key !== "Tab") {
            return;
        }

        const modalElement = modalRef.current;

        if (!modalElement) {
            return;
        }

        const focusableElements = getFocusableElements(modalElement);

        if (focusableElements.length === 0) {
            event.preventDefault();
            focusWithoutScrolling(modalElement);
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
            event.preventDefault();
            focusWithoutScrolling(lastElement);
            return;
        }

        if (!event.shiftKey && activeElement === lastElement) {
            event.preventDefault();
            focusWithoutScrolling(firstElement);
            return;
        }

        if (!(activeElement instanceof Node) || !modalElement.contains(activeElement)) {
            event.preventDefault();
            focusWithoutScrolling(firstElement);
        }
    }

    return (
        <>
            <section
                ref={modalRef}
                className={`slds-modal slds-fade-in-open ${narrow ? "slds-modal_small" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onKeyDown={handleModalKeyDown}
            >
                <div className="slds-modal__container">
                    <header className="slds-modal__header">
                        <button className="slds-button slds-button_icon slds-modal__close" type="button" onClick={onClose} aria-label="閉じる">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h2 id={titleId} className="slds-modal__title slds-hyphenate">{title}</h2>
                    </header>
                    {children}
                </div>
            </section>
            <div className="slds-backdrop slds-backdrop_open" />
        </>
    );
}

export function ModalFooter({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
    return (
        <div className="slds-modal__footer">
            <button className="slds-button slds-button_neutral" type="button" onClick={onCancel}>
                キャンセル
            </button>
            <button className="slds-button slds-button_brand heroku-brand-action" type="submit" disabled={saving}>
                {saving ? "保存中..." : "保存"}
            </button>
        </div>
    );
}
