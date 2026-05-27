import type { ReactNode } from "react";

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
    return (
        <>
            <section className={`slds-modal slds-fade-in-open ${narrow ? "slds-modal_small" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="slds-modal__container">
                    <header className="slds-modal__header">
                        <button className="slds-button slds-button_icon slds-modal__close" type="button" onClick={onClose} aria-label="閉じる">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h2 className="slds-modal__title slds-hyphenate">{title}</h2>
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
