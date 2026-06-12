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
        <main className="slds-template_default slds-grid slds-grid_align-center slds-grid_vertical-align-center slds-p-around_large slds-theme_shade playground-login-page">
            <section className="slds-box slds-theme_default slds-p-around_none slds-size_1-of-1 slds-medium-size_8-of-12 slds-large-size_6-of-12" aria-labelledby="login-title">
                <div>
                    <div className="slds-theme_shade slds-border_bottom slds-p-around_large">
                        <div className="slds-grid slds-wrap slds-gutters_x-small">
                            <span className="slds-badge slds-theme_success">個人学習用</span>
                            <span className="slds-badge slds-theme_inverse">Heroku</span>
                        </div>
                        <h1 id="login-title" className="slds-text-heading_large slds-m-top_large">
                            Salesforce API Playground
                        </h1>
                    </div>

                    <div className="slds-p-around_large">
                        <div className="slds-m-vertical_x-large">
                            <a
                                className="slds-button slds-button_brand slds-button_stretch"
                                href="/api/auth/login"
                            >
                                Salesforce に接続
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
