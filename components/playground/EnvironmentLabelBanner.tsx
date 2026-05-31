import type { EnvironmentLabel } from "@/lib/environment-label";

export function EnvironmentLabelBanner({ environmentLabel }: { environmentLabel: EnvironmentLabel | null }) {
    if (!environmentLabel) {
        return null;
    }

    return (
        <div className="slds-notify slds-notify_alert slds-theme_inverse slds-theme_alert-texture playground-environment-label" role="status">
            <span className="slds-assistive-text">環境ラベル</span>
            <span className="slds-text-title_bold playground-environment-label__text">
                {environmentLabel.label}
            </span>
        </div>
    );
}
