"use client";

import type { MouseEvent, ReactNode } from "react";

export const LOGIN_PATH = "/api/auth/login";

type LoginClickState = {
    button: number;
    ctrlKey: boolean;
    defaultPrevented: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    target?: string;
};

type LoginLinkProps = {
    children: ReactNode;
    className: string;
};

export function shouldReplaceLoginNavigation({
    button,
    ctrlKey,
    defaultPrevented,
    metaKey,
    shiftKey,
    target
}: LoginClickState) {
    return !defaultPrevented
        && button === 0
        && !metaKey
        && !ctrlKey
        && !shiftKey
        && (!target || target === "_self");
}

export function LoginLink({ children, className }: LoginLinkProps) {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (!shouldReplaceLoginNavigation({
            button: event.button,
            ctrlKey: event.ctrlKey,
            defaultPrevented: event.defaultPrevented,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            target: event.currentTarget.target
        })) {
            return;
        }

        event.preventDefault();
        window.location.replace(LOGIN_PATH);
    }

    return (
        <a className={className} href={LOGIN_PATH} onClick={handleClick}>
            {children}
        </a>
    );
}
