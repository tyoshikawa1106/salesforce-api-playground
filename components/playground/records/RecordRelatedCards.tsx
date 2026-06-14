"use client";

import { useId, useState } from "react";
import type { Contact } from "../utils/types";
import { getContactName } from "../utils/formatting";
import { StandardIcon, UtilityIcon } from "../shell/SldsIcon";
import { renderEmailLink, renderPhoneLink } from "./RecordValueLinks";

const relatedContactVisibleLimit = 5;

function ContactIcon({ label }: { label: string }) {
    return (
        <span className="slds-icon_container slds-icon-standard-contact" title={label}>
            <StandardIcon className="slds-icon slds-icon_small" name="contact" />
            <span className="slds-assistive-text">{label}</span>
        </span>
    );
}

export function RelatedContactsCard({
    contacts,
    onDeleteContact,
    onEditContact,
    onOpenContact
}: {
    contacts: Contact[];
    onDeleteContact: (contact: Contact) => void;
    onEditContact: (contact: Contact) => void;
    onOpenContact: (contact: Contact) => void;
}) {
    const visibleContacts = contacts.slice(0, relatedContactVisibleLimit);
    const showViewAll = contacts.length > relatedContactVisibleLimit;

    return (
        <article className="slds-card slds-card_boundary">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <ContactIcon label="取引先責任者" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>取引先責任者 ({contacts.length})</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                {contacts.length === 0 ? (
                    <p className="slds-text-color_weak">この取引先に関連する取引先責任者はありません。</p>
                ) : (
                    <ul className="slds-grid slds-wrap slds-grid_pull-padded">
                        {visibleContacts.map((contact) => {
                            const contactName = getContactName(contact);

                            return (
                                <li className="slds-p-horizontal_small slds-size_1-of-1" key={contact.Id}>
                                    <article className="slds-tile slds-media slds-card__tile slds-hint-parent">
                                        <div className="slds-media__figure">
                                            <ContactIcon label="取引先責任者" />
                                        </div>
                                        <div className="slds-media__body">
                                            <div className="slds-grid slds-grid_align-spread slds-has-flexi-truncate">
                                                <h3 className="slds-tile__title slds-truncate" title={contactName}>
                                                    <button
                                                        className="slds-button_reset slds-text-link"
                                                        type="button"
                                                        onClick={() => onOpenContact(contact)}
                                                    >
                                                        {contactName}
                                                    </button>
                                                </h3>
                                                <RelatedContactActions
                                                    contact={contact}
                                                    contactName={contactName}
                                                    onDeleteContact={onDeleteContact}
                                                    onEditContact={onEditContact}
                                                />
                                            </div>
                                            <div className="slds-tile__detail">
                                                <dl className="slds-list_horizontal slds-wrap">
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate" title="役職">役職:</dt>
                                                    <dd className="slds-item_detail slds-truncate" title={contact.Title || "-"}>{contact.Title || "-"}</dd>
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate" title="メール">メール:</dt>
                                                    <dd className="slds-item_detail slds-truncate">{renderEmailLink(contact.Email) || "-"}</dd>
                                                    <dt className="slds-item_label slds-text-color_weak slds-truncate" title="電話">電話:</dt>
                                                    <dd className="slds-item_detail slds-truncate">{renderPhoneLink(contact.Phone) || "-"}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {showViewAll ? (
                <footer className="slds-card__footer">
                    <a
                        className="slds-card__footer-action"
                        href="#"
                        aria-disabled="true"
                        onClick={(event) => event.preventDefault()}
                    >
                        View All
                        <span className="slds-assistive-text">取引先責任者</span>
                    </a>
                </footer>
            ) : null}
        </article>
    );
}

function RelatedContactActions({
    contact,
    contactName,
    onDeleteContact,
    onEditContact
}: {
    contact: Contact;
    contactName: string;
    onDeleteContact: (contact: Contact) => void;
    onEditContact: (contact: Contact) => void;
}) {
    const [open, setOpen] = useState(false);
    const menuId = useId();
    const menuLabel = `${contactName} の操作`;

    function runAction(action: (contact: Contact) => void) {
        setOpen(false);
        action(contact);
    }

    return (
        <div className={`slds-shrink-none slds-dropdown-trigger slds-dropdown-trigger_click${open ? " slds-is-open" : ""}`}>
            <button
                className="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small"
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={menuId}
                title={menuLabel}
                onClick={() => setOpen((currentOpen) => !currentOpen)}
            >
                <UtilityIcon className="slds-button__icon slds-button__icon_hint" name="down" />
                <span className="slds-assistive-text">{menuLabel}</span>
            </button>
            <div className="slds-dropdown slds-dropdown_right" id={menuId}>
                <ul className="slds-dropdown__list" role="menu" aria-label={menuLabel}>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={open ? 0 : -1}
                            onClick={(event) => {
                                event.preventDefault();
                                runAction(onEditContact);
                            }}
                        >
                            <span title="編集">編集</span>
                        </a>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={open ? 0 : -1}
                            onClick={(event) => {
                                event.preventDefault();
                                runAction(onDeleteContact);
                            }}
                        >
                            <span title="削除">削除</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
