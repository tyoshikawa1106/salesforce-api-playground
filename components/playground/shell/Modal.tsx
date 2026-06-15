"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { UtilityIcon } from "./SldsIcon";

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

function shouldFocusInitialField(): boolean {
    return !window.matchMedia("(max-width: 767px)").matches;
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
    children?: ReactNode;
}) {
    const titleId = useId();
    const modalRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const modalElement = modalRef.current;
        const previousBodyOverflow = document.body.style.overflow;

        if (modalElement) {
            focusWithoutScrolling(shouldFocusInitialField() ? getInitialFocusElement(modalElement) : modalElement);
        }

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            focusWithoutScrolling(activeElement);
        };
    }, []);

    useEffect(() => {
        function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        }

        document.addEventListener("keydown", handleDocumentKeyDown);

        return () => {
            document.removeEventListener("keydown", handleDocumentKeyDown);
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
                className={`slds-modal slds-fade-in-open${narrow ? " slds-modal_small" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onKeyDown={handleModalKeyDown}
            >
                <div className="slds-modal__container">
                    <button className="slds-button slds-button_icon slds-modal__close" type="button" onClick={onClose}>
                        <UtilityIcon className="slds-button__icon slds-button__icon_large" name="close" />
                        <span className="slds-assistive-text">閉じる</span>
                    </button>
                    <div className="slds-modal__header">
                        <h1 id={titleId} className="slds-modal__title slds-hyphenate" tabIndex={-1}>{title}</h1>
                    </div>
                    {children}
                </div>
            </section>
            <div className="slds-backdrop slds-backdrop_open" role="presentation" />
        </>
    );
}

export function ModalFooter({ className = "", saving, onCancel }: { className?: string; saving: boolean; onCancel: () => void }) {
    return (
        <div className={`slds-modal__footer ${className}`.trim()}>
            <button className="slds-button slds-button_neutral" type="button" aria-label="キャンセルして閉じる" onClick={onCancel} disabled={saving}>
                キャンセル
            </button>
            <button className="slds-button slds-button_brand" type="submit" disabled={saving}>
                {saving ? "保存中..." : "保存"}
            </button>
        </div>
    );
}
