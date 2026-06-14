"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import { apiRequest } from "../utils/api";
import {
    getLookupApiObject,
    getLookupObjectLabel,
    type ActivityLookupApiResponse,
    type ActivityLookupOption,
    type RemoteLookupObjectLabel
} from "./activity-task-form";

export function useQuickActionLookupState({
    objectLabel,
    onChange,
    options,
    value
}: {
    objectLabel: RemoteLookupObjectLabel;
    onChange: (value: ActivityLookupOption | undefined) => void;
    options: ActivityLookupOption[];
    value?: ActivityLookupOption;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [remoteMessage, setRemoteMessage] = useState("");
    const [remoteOptions, setRemoteOptions] = useState<ActivityLookupOption[] | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const requestIdRef = useRef(0);
    const lookupObject = getLookupApiObject(objectLabel);
    const normalizedQuery = query.trim();
    const availableOptions = remoteOptions ?? options;
    const filteredOptions = availableOptions.filter((option) => {
        if (!normalizedQuery) {
            return false;
        }

        return [option.label, option.meta].some((text) => text?.toLowerCase().includes(normalizedQuery.toLowerCase()));
    });

    useEffect(() => {
        if (value || !normalizedQuery) {
            requestIdRef.current += 1;
            setOpen(false);
            setLoadingOptions(false);
            setRemoteMessage("");
            setRemoteOptions(null);
            return;
        }

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setOpen(false);
        setLoadingOptions(true);
        setRemoteMessage("");
        setRemoteOptions(null);

        const timeoutId = window.setTimeout(() => {
            apiRequest<ActivityLookupApiResponse>(
                buildPlaygroundApiRequest(playgroundApiPaths.activityLookups(lookupObject, normalizedQuery))
            )
                .then((data) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions(data.options.map((option) => ({
                        id: option.id,
                        label: option.label,
                        meta: option.meta,
                        objectLabel: getLookupObjectLabel(option.object)
                    })));
                    setLoadingOptions(false);
                    setOpen(true);
                })
                .catch((error) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions([]);
                    setRemoteMessage(error instanceof Error ? error.message : "候補を取得できませんでした。");
                    setLoadingOptions(false);
                    setOpen(true);
                });
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [lookupObject, normalizedQuery, value]);

    useEffect(() => {
        setActiveIndex((current) => Math.min(current, Math.max(filteredOptions.length - 1, 0)));
    }, [filteredOptions.length]);

    function selectOption(option: ActivityLookupOption) {
        requestIdRef.current += 1;
        onChange(option);
        setQuery("");
        setOpen(false);
    }

    function clearValue() {
        requestIdRef.current += 1;
        onChange(undefined);
        setQuery("");
        setActiveIndex(0);
        setRemoteOptions(null);
        setOpen(false);
    }

    function changeQuery(nextQuery: string) {
        requestIdRef.current += 1;
        setQuery(nextQuery);
        setActiveIndex(0);
        setRemoteOptions(null);
        setRemoteMessage("");
        setLoadingOptions(false);
        setOpen(false);
    }

    function openResolvedOptions() {
        if (normalizedQuery && remoteOptions !== null && !loadingOptions) {
            setOpen(true);
        }
    }

    function closeResolvedOptions() {
        setOpen(false);
    }

    function hasResolvedOptions() {
        return Boolean(normalizedQuery && remoteOptions !== null && !loadingOptions);
    }

    function openResolvedOptionsFromKeyboard() {
        if (!hasResolvedOptions()) {
            return false;
        }

        setOpen(true);

        return true;
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!openResolvedOptionsFromKeyboard()) {
                return;
            }
            setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!openResolvedOptionsFromKeyboard()) {
                return;
            }
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (event.key === "Enter" && open && filteredOptions[activeIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
        }
    }

    return {
        activeIndex,
        changeQuery,
        closeResolvedOptions,
        clearValue,
        filteredOptions,
        handleKeyDown,
        loadingOptions,
        openResolvedOptions,
        open,
        query,
        remoteMessage,
        selectOption,
        setActiveIndex
    };
}
