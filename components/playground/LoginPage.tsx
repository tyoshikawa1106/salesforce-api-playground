import Image from "next/image";
import { salesforceLogo } from "./icons";
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
        <main className="slds-template_default slds-grid slds-grid_align-center slds-grid_vertical-align-center slds-p-around_large slds-theme_shade playground-login-page">
            <section className="slds-box slds-theme_default slds-size_1-of-1 slds-medium-size_5-of-12 slds-large-size_1-of-3 slds-p-around_x-large playground-login-panel" aria-labelledby="login-title">
                <div className="slds-grid slds-grid_vertical-align-center slds-gutters_small slds-m-bottom_x-large">
                    <div className="slds-col_bump-right">
                        <Image
                            className="salesforce-brand-logo"
                            src={salesforceLogo}
                            alt="Salesforce"
                            width={58}
                            height={40}
                            priority
                        />
                    </div>
                    <span className="slds-badge slds-theme_inverse">Heroku</span>
                </div>

                <div className="slds-text-align_center">
                    <span className="slds-icon_container slds-icon-standard-home playground-login-icon" title="Salesforce API Playground">
                        <StandardIcon className="slds-icon playground-page-header-icon__image" name="home" />
                        <span className="slds-assistive-text">Salesforce API Playground</span>
                    </span>
                    <h1 id="login-title" className="slds-text-heading_large slds-m-top_x-large">
                        Salesforce API Playground
                    </h1>
                    <p className="slds-text-body_regular slds-text-color_weak slds-m-top_medium">
                        個人学習用アプリケーション
                    </p>
                </div>

                <div className="slds-m-top_x-large">
                    <a
                        className="slds-button slds-button_brand slds-button_stretch heroku-brand-action"
                        href="/api/auth/login"
                    >
                        Salesforce に接続
                    </a>
                </div>
            </section>
        </main>
    );
}
