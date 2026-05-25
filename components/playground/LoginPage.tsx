import Image from "next/image";
import homeIcon from "@salesforce-ux/design-system/assets/icons/standard/home.svg";
import { salesforceLogo } from "./icons";

export function LoginPage({ loading = false }: { loading?: boolean }) {
    return (
        <main className="slds-template_default slds-grid slds-grid_align-center slds-grid_vertical-align-center slds-p-around_large slds-theme_shade playground-login-page">
            <section className="slds-box slds-theme_default playground-login-panel" aria-labelledby="login-title">
                <div className="slds-grid slds-grid_vertical-align-center slds-gutters_small playground-login-brand-row">
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
                        <Image
                            className="slds-icon playground-page-header-icon__image"
                            src={homeIcon}
                            alt=""
                            width={40}
                            height={40}
                            aria-hidden="true"
                        />
                        <span className="slds-assistive-text">Salesforce API Playground</span>
                    </span>
                    <h1 id="login-title" className="slds-text-heading_large playground-login-title">
                        Salesforce API Playground
                    </h1>
                    <p className="slds-text-body_regular slds-text-color_weak playground-login-description">
                        個人学習用アプリケーション
                    </p>
                </div>

                <div className="playground-login-action">
                    <a
                        className={`slds-button slds-button_brand slds-button_stretch heroku-brand-action ${loading ? "slds-disabled" : ""}`}
                        href={loading ? undefined : "/api/auth/login"}
                        aria-disabled={loading}
                    >
                        {loading ? "Checking connection..." : "Connect Salesforce"}
                    </a>
                </div>
            </section>
        </main>
    );
}
