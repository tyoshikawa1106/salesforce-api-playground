import type { EnvironmentLabel } from "@/lib/environment-label";

export function EnvironmentLabelBanner({ environmentLabel }: { environmentLabel: EnvironmentLabel | null }) {
    if (!environmentLabel) {
        return null;
    }

    return (
        <div className="slds-notify slds-notify_alert playground-environment-label" role="status">
            <span className="slds-assistive-text">環境ラベル</span>
            <span className="slds-badge playground-environment-label__badge">
                {environmentLabel.label}
            </span>
        </div>
    );
}
