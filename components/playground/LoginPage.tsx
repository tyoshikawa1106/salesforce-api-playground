import { StandardIcon } from "./SldsIcon";

export function SessionLoadingPage() {
    return (
        <main className="slds-template_default slds-grid slds-grid_align-center slds-grid_vertical-align-center slds-p-around_large slds-theme_shade playground-login-page">
            <section className="slds-text-align_center" aria-live="polite" aria-busy="true">
                <div className="slds-spinner slds-spinner_medium slds-spinner_brand" role="status">
                    <span className="slds-assistive-text">接続状態を確認しています...</span>
                    <div className="slds-spinner__dot-a" />
                    <div className="slds-spinner__dot-b" />
                </div>
                <p className="slds-text-body_regular slds-text-color_weak slds-m-top_x-large">
                    接続状態を確認しています...
                </p>
            </section>
        </main>
    );
}

export function LoginPage() {
    return (
        <main className="slds-template_default slds-grid slds-grid_align-center slds-grid_vertical-align-center slds-p-around_large playground-login-page">
            <section className="slds-box slds-theme_default slds-size_1-of-1 slds-medium-size_10-of-12 slds-large-size_7-of-12 playground-login-panel" aria-labelledby="login-title">
                <div className="slds-grid slds-wrap slds-gutters_large playground-login-panel__content">
                    <div className="slds-col slds-size_1-of-1 slds-large-size_5-of-12 playground-login-brand">
                        <span className="slds-badge slds-theme_success">個人学習用</span>
                        <h1 id="login-title" className="slds-text-heading_large slds-m-top_large">
                            Salesforce API Playground
                        </h1>
                    </div>

                    <div className="slds-col slds-size_1-of-1 slds-large-size_7-of-12 playground-login-form">
                        <div className="slds-text-align_center">
                            <span className="slds-icon_container slds-icon-standard-connected-apps playground-login-icon" title="Salesforce 接続">
                                <StandardIcon className="slds-icon playground-page-header-icon__image" name="connectedApps" />
                                <span className="slds-assistive-text">Salesforce 接続</span>
                            </span>
                        </div>

                        <div className="slds-m-top_large">
                            <a
                                className="slds-button slds-button_brand slds-button_stretch"
                                href="/api/auth/login"
                            >
                                Salesforce に接続
                            </a>
                        </div>

                        <div className="slds-scoped-notification slds-media slds-media_center slds-theme_shade slds-m-top_large" role="status">
                            <div className="slds-media__figure">
                                <span className="slds-icon_container slds-icon-standard-home" title="Playground">
                                    <StandardIcon className="slds-icon slds-icon_small" name="home" />
                                    <span className="slds-assistive-text">Playground</span>
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <p className="slds-text-body_small">
                                    本番データではなく、学習・検証用の Salesforce 組織で利用してください。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
