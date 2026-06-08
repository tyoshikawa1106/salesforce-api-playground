import type { ReactNode } from "react";

function trimValue(value: string | null | undefined) {
    return value?.trim() || "";
}

function buildPhoneHref(value: string) {
    const normalized = value.replace(/[^\d+]/g, "");
    return normalized ? `tel:${normalized}` : "";
}

function buildEmailHref(value: string) {
    return /\s/.test(value) ? "" : `mailto:${encodeURIComponent(value)}`;
}

function buildWebsiteHref(value: string) {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    try {
        const url = new URL(candidate);

        if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
            return "";
        }

        return url.toString();
    } catch {
        return "";
    }
}

function renderLink(value: string | null | undefined, buildHref: (value: string) => string, options?: { external?: boolean }): ReactNode | undefined {
    const label = trimValue(value);

    if (!label) {
        return undefined;
    }

    const href = buildHref(label);

    if (!href) {
        return label;
    }

    return (
        <a
            className="slds-text-link"
            href={href}
            rel={options?.external ? "noreferrer" : undefined}
            target={options?.external ? "_blank" : undefined}
        >
            {label}
        </a>
    );
}

export function renderPhoneLink(value: string | null | undefined) {
    return renderLink(value, buildPhoneHref);
}

export function renderEmailLink(value: string | null | undefined) {
    return renderLink(value, buildEmailHref);
}

export function renderWebsiteLink(value: string | null | undefined) {
    return renderLink(value, buildWebsiteHref, { external: true });
}
