import type { EnvironmentLabel } from "@/lib/environment-label";

export function EnvironmentLabelBanner({ environmentLabel }: { environmentLabel: EnvironmentLabel | null }) {
    if (!environmentLabel) {
        return null;
    }

    return (
        <div className="slds-notify slds-notify_alert playground-environment-label" role="alert">
            <span className="slds-assistive-text">環境ラベル</span>
            <h2 className="playground-environment-label__text">
                {environmentLabel.label}
            </h2>
        </div>
    );
}
