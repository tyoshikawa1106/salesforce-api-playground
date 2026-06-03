import type { Contact } from "./types";
import { getContactName } from "./formatting";
import { StandardPageHeaderIcon } from "./Navigation";

export function RecordNotice({ title }: { title: string }) {
    return (
        <section className="slds-box slds-box_x-small slds-theme_default slds-m-bottom_x-small">
            <div className="slds-media">
                <div className="slds-media__figure">
                    <span className="slds-icon_container slds-icon-utility-warning" aria-hidden="true" />
                </div>
                <div className="slds-media__body">
                    <h2 className="slds-text-heading_small">{title}</h2>
                    <p className="slds-text-body_regular slds-m-top_small">
                        このプレイグラウンドでは、API から返された Salesforce レコードを表示しています。
                    </p>
                </div>
            </div>
        </section>
    );
}

export function RelatedContactsCard({ contacts }: { contacts: Contact[] }) {
    return (
        <section className="slds-card slds-card_boundary playground-record-related-card">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="contacts" label="取引先責任者" />
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
                    <div className="slds-grid slds-wrap slds-gutters_x-small">
                        {contacts.slice(0, 4).map((contact) => (
                            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2" key={contact.Id}>
                                <article className="slds-tile slds-media">
                                    <div className="slds-media__figure">
                                        <StandardPageHeaderIcon tab="contacts" label="取引先責任者" />
                                    </div>
                                    <div className="slds-media__body">
                                        <h3 className="slds-tile__title slds-truncate" title={getContactName(contact)}>
                                            {getContactName(contact)}
                                        </h3>
                                        <div className="slds-tile__detail">
                                            <p className="slds-truncate">役職: {contact.Title || "-"}</p>
                                            <p className="slds-truncate">メール: {contact.Email || "-"}</p>
                                            <p className="slds-truncate">電話: {contact.Phone || "-"}</p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export function RelatedAccountCard({ accountName }: { accountName?: string }) {
    return (
        <section className="slds-card slds-card_boundary playground-record-related-card">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                        <StandardPageHeaderIcon tab="accounts" label="取引先" />
                    </div>
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">
                            <span>取引先</span>
                        </h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <p className="slds-text-link">{accountName || "取引先なし"}</p>
            </div>
        </section>
    );
}
