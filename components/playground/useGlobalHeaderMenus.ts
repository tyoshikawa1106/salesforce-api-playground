"use client";

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

export const actionPopoverIds = {
    "グローバルアクション": "global-action-popover",
    ヘルプ: "global-help-popover",
    設定: "global-settings-popover"
} as const;

export type ActionPopoverLabel = keyof typeof actionPopoverIds;

export function useGlobalHeaderMenus() {
    const actionPopoverCloseTimer = useRef<number | null>(null);
    const profileMenuCloseTimer = useRef<number | null>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const [activeActionPopover, setActiveActionPopover] = useState<ActionPopoverLabel | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotificationBadge, setShowNotificationBadge] = useState(false);

    const cancelProfileMenuClose = useCallback((): void => {
        if (profileMenuCloseTimer.current) {
            window.clearTimeout(profileMenuCloseTimer.current);
            profileMenuCloseTimer.current = null;
        }
    }, []);

    const scheduleProfileMenuClose = useCallback((): void => {
        cancelProfileMenuClose();
        profileMenuCloseTimer.current = window.setTimeout(() => {
            setProfileMenuOpen(false);
            profileMenuCloseTimer.current = null;
        }, 250);
    }, [cancelProfileMenuClose]);

    const cancelActionPopoverClose = useCallback((): void => {
        if (actionPopoverCloseTimer.current) {
            window.clearTimeout(actionPopoverCloseTimer.current);
            actionPopoverCloseTimer.current = null;
        }
    }, []);

    const closeMenus = useCallback((): void => {
        cancelActionPopoverClose();
        cancelProfileMenuClose();
        setActiveActionPopover(null);
        setProfileMenuOpen(false);
    }, [cancelActionPopoverClose, cancelProfileMenuClose]);

    const scheduleActionPopoverClose = useCallback((): void => {
        cancelActionPopoverClose();
        actionPopoverCloseTimer.current = window.setTimeout(() => {
            setActiveActionPopover(null);
            actionPopoverCloseTimer.current = null;
        }, 250);
    }, [cancelActionPopoverClose]);

    const toggleActionPopover = useCallback((label: ActionPopoverLabel): void => {
        cancelActionPopoverClose();
        setProfileMenuOpen(false);
        setActiveActionPopover((currentLabel) => (currentLabel === label ? null : label));
    }, [cancelActionPopoverClose]);

    const toggleProfileMenu = useCallback((): void => {
        cancelProfileMenuClose();
        setActiveActionPopover(null);
        setProfileMenuOpen((isOpen) => !isOpen);
    }, [cancelProfileMenuClose]);

    const closeOnEscape = useCallback((event: KeyboardEvent): void => {
        if (event.key !== "Escape") {
            return;
        }

        closeMenus();
    }, [closeMenus]);

    const toggleNotificationBadge = useCallback((): void => {
        setShowNotificationBadge((visible) => !visible);
    }, []);

    useEffect(() => {
        function closeOnPointerDown(event: PointerEvent): void {
            if (!headerRef.current?.contains(event.target as Node)) {
                closeMenus();
            }
        }

        document.addEventListener("pointerdown", closeOnPointerDown);
        return () => {
            document.removeEventListener("pointerdown", closeOnPointerDown);
            cancelActionPopoverClose();
            cancelProfileMenuClose();
        };
    }, [cancelActionPopoverClose, cancelProfileMenuClose, closeMenus]);

    return {
        activeActionPopover,
        cancelActionPopoverClose,
        cancelProfileMenuClose,
        closeOnEscape,
        headerRef,
        profileMenuOpen,
        scheduleActionPopoverClose,
        scheduleProfileMenuClose,
        showNotificationBadge,
        toggleActionPopover,
        toggleNotificationBadge,
        toggleProfileMenu
    };
}
