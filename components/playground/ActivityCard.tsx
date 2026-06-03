export function ActivityCard() {
    return (
        <section className="slds-card slds-card_boundary">
            <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__body">
                        <h2 className="slds-card__header-title">活動</h2>
                    </div>
                </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
                <div className="slds-tabs_default">
                    <ul className="slds-tabs_default__nav" role="tablist">
                        <li className="slds-tabs_default__item slds-is-active" role="presentation">
                            <button
                                className="slds-tabs_default__link slds-button_reset"
                                type="button"
                                role="tab"
                                id="activity-tab"
                                aria-selected="true"
                                aria-controls="activity-panel"
                            >
                                活動
                            </button>
                        </li>
                        <li className="slds-tabs_default__item" role="presentation">
                            <button
                                className="slds-tabs_default__link slds-button_reset"
                                type="button"
                                role="tab"
                                id="chatter-tab"
                                aria-selected="false"
                                aria-controls="activity-panel"
                            >
                                Chatter
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="slds-illustration slds-illustration_small slds-p-around_medium" role="tabpanel" id="activity-panel" aria-labelledby="activity-tab">
                    <div className="slds-text-align_center">
                        <h3 className="slds-text-heading_small">表示する活動はありません。</h3>
                        <p className="slds-text-color_weak slds-m-top_x-small">メール送信や ToDo の予定作成で作業を記録できます。</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
