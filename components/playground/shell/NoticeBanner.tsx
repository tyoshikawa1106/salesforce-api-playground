import type { Notice } from "../utils/types";

export function NoticeBanner({ notice }: { notice: Notice }) {
    const theme = notice.tone === "success" ? "slds-theme_success" : notice.tone === "error" ? "slds-theme_error" : "slds-theme_info";
    return (
        <div className="slds-notify_container">
            <div className={`slds-notify slds-notify_toast ${theme}`} role="status">
                <div className="slds-notify__content">
                    <h2 className="slds-text-heading_small">{notice.message}</h2>
                </div>
            </div>
        </div>
    );
}
