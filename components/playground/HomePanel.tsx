import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "./PageHeader";

type HomeCountsProps = {
    accountCount: number;
    contactCount: number;
    eventCount: number;
    recycleBinCount: number;
    taskCount: number;
    userCount: number;
};

export function HomePanel() {
    return (
        <PageHeader
            tab="home"
            eyebrow="ホーム"
            title="Salesforce API Playground"
            metaText="Salesforce OAuth と REST API を試すための Next.js アプリ"
        />
    );
}

export function HomeCounts({
    accountCount,
    contactCount,
    eventCount,
    recycleBinCount,
    taskCount,
    userCount
}: HomeCountsProps) {
    const summaries = [
        ["取引先", accountCount],
        ["取引先責任者", contactCount],
        ["行動", eventCount],
        ["ToDo", taskCount],
        ["ユーザー", userCount],
        ["ごみ箱", recycleBinCount]
    ] as const;

    return (
        <section className="slds-m-top_small playground-home-count-summary">
            <div className="slds-grid slds-wrap slds-gutters playground-home-counts">
                {summaries.map(([label, count]) => (
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 playground-home-counts__item" key={label}>
                        <article className="slds-tile slds-box slds-box_x-small slds-theme_default">
                            <h2 className="slds-tile__title slds-truncate" title={label}>
                                {label}
                            </h2>
                            <div className="slds-tile__detail">
                                <p className="slds-text-heading_medium" title={`${count} 件`}>
                                    <AnimatedCount value={count} />
                                </p>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </section>
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
