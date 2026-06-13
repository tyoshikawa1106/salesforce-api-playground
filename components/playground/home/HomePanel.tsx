import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeRecordCounts } from "@/lib/playground-record-counts";
import { PageHeader } from "../shell/PageHeader";
import { StandardIcon, type StandardIconName } from "../shell/SldsIcon";

export type HomeCountValues = HomeRecordCounts & {
    accounts: number;
    contacts: number;
    events: number;
    recycleBinItems: number;
    tasks: number;
    users: number;
};

type HomeCountsProps = {
    counts: HomeCountValues;
    loading?: boolean;
};

type HomeCountCardConfig = {
    key: keyof HomeCountValues;
    iconClassName: string;
    iconName: StandardIconName;
    label: string;
};

const homeCountCardConfigs: HomeCountCardConfig[] = [
    { key: "accounts", iconClassName: "slds-icon-standard-account", iconName: "account", label: "取引先" },
    { key: "contacts", iconClassName: "slds-icon-standard-contact", iconName: "contact", label: "取引先責任者" },
    { key: "events", iconClassName: "slds-icon-standard-event", iconName: "event", label: "行動" },
    { key: "tasks", iconClassName: "slds-icon-standard-task", iconName: "task", label: "ToDo" },
    { key: "users", iconClassName: "slds-icon-standard-user", iconName: "user", label: "ユーザー" },
    { key: "recycleBinItems", iconClassName: "slds-icon-standard-empty", iconName: "recycleBin", label: "ごみ箱" },
    { key: "leads", iconClassName: "slds-icon-standard-lead", iconName: "lead", label: "リード" },
    { key: "opportunities", iconClassName: "slds-icon-standard-opportunity", iconName: "opportunity", label: "商談" },
    { key: "products", iconClassName: "slds-icon-standard-product", iconName: "product", label: "商品" },
    { key: "campaigns", iconClassName: "slds-icon-standard-campaign", iconName: "campaign", label: "キャンペーン" },
    { key: "cases", iconClassName: "slds-icon-standard-case", iconName: "case", label: "ケース" },
    { key: "emailMessages", iconClassName: "slds-icon-standard-email", iconName: "email", label: "メールメッセージ" }
];

export function HomePanel({ userName }: { userName?: string }) {
    return (
        <PageHeader
            tab="home"
            title="Salesforce API Playground"
            metaText={userName ? `Login: ${userName}` : "Login:"}
        />
    );
}

export function HomeCounts({
    counts,
    loading = false
}: HomeCountsProps) {
    return (
        <section className="slds-m-top_small playground-home-count-summary">
            <div className="slds-grid slds-wrap slds-gutters playground-home-counts">
                {homeCountCardConfigs.map((config) => (
                    <RecordCountCard
                        key={config.key}
                        config={config}
                        count={counts[config.key]}
                        loading={loading}
                    />
                ))}
            </div>
        </section>
    );
}

function RecordCountCard({
    config,
    count,
    loading
}: {
    config: HomeCountCardConfig;
    count: number;
    loading: boolean;
}) {
    const { iconClassName, iconName, label } = config;

    return (
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 playground-home-counts__item">
            <article className="slds-tile slds-box slds-box_x-small slds-theme_default playground-home-count-card">
                <h2 className="slds-tile__title playground-home-count-card__label" title={label}>
                    <span className="slds-media slds-media_center">
                        <span className="slds-media__figure slds-m-right_x-small">
                            <span className={`slds-icon_container ${iconClassName}`} title={label}>
                                <StandardIcon className="slds-icon slds-icon_x-small" name={iconName} />
                            </span>
                        </span>
                        <span className="slds-media__body slds-truncate">
                            {label}
                        </span>
                    </span>
                </h2>
                <div className="slds-tile__detail playground-home-count-card__content">
                    <p className="slds-text-heading_medium slds-text-align_center slds-is-relative" title={loading ? undefined : `${count} 件`}>
                        {loading ? <CountLoadingSpinner label={label} /> : <AnimatedCount value={count} />}
                    </p>
                </div>
            </article>
        </div>
    );
}

function CountLoadingSpinner({ label }: { label: string }) {
    return (
        <span className="slds-spinner slds-spinner_small slds-spinner_brand" role="status">
            <span className="slds-assistive-text">{label}の件数を読み込んでいます...</span>
            <span className="slds-spinner__dot-a" />
            <span className="slds-spinner__dot-b" />
        </span>
    );
}

function AnimatedCount({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValueRef = useRef(0);
    const numberFormatter = useMemo(() => new Intl.NumberFormat("ja-JP"), []);

    useEffect(() => {
        if (typeof window === "undefined") {
            setDisplayValue(value);
            previousValueRef.current = value;
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            setDisplayValue(value);
            previousValueRef.current = value;
            return;
        }

        const startValue = previousValueRef.current;
        const change = value - startValue;
        const duration = 650;
        let frameId = 0;
        let startTime: number | null = null;

        function tick(timestamp: number) {
            startTime ??= timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - (1 - progress) ** 3;

            setDisplayValue(Math.round(startValue + change * easedProgress));

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick);
                return;
            }

            previousValueRef.current = value;
        }

        frameId = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(frameId);
    }, [value]);

    return numberFormatter.format(displayValue);
}
