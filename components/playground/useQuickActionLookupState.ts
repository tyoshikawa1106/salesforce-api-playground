"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import { apiRequest } from "./api";
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
    const availableOptions = remoteOptions ?? options;
    const filteredOptions = availableOptions.filter((option) => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return true;
        }

        return [option.label, option.meta].some((text) => text?.toLowerCase().includes(normalizedQuery));
    });

    useEffect(() => {
        if (!open || value) {
            return;
        }

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoadingOptions(true);
        setRemoteMessage("");

        const timeoutId = window.setTimeout(() => {
            apiRequest<ActivityLookupApiResponse>(
                buildPlaygroundApiRequest(playgroundApiPaths.activityLookups(lookupObject, query))
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
                })
                .catch((error) => {
                    if (requestIdRef.current !== requestId) {
                        return;
                    }

                    setRemoteOptions([]);
                    setRemoteMessage(error instanceof Error ? error.message : "候補を取得できませんでした。");
                })
                .finally(() => {
                    if (requestIdRef.current === requestId) {
                        setLoadingOptions(false);
                    }
                });
        }, query.trim() ? 250 : 0);

        return () => window.clearTimeout(timeoutId);
    }, [lookupObject, open, query, value]);

    useEffect(() => {
        setActiveIndex((current) => Math.min(current, Math.max(filteredOptions.length - 1, 0)));
    }, [filteredOptions.length]);

    function selectOption(option: ActivityLookupOption) {
        onChange(option);
        setQuery("");
        setOpen(false);
    }

    function clearValue() {
        onChange(undefined);
        setQuery("");
        setActiveIndex(0);
        setRemoteOptions(null);
        setOpen(false);
    }

    function changeQuery(nextQuery: string) {
        setQuery(nextQuery);
        setActiveIndex(0);
        setOpen(true);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
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
        clearValue,
        filteredOptions,
        handleKeyDown,
        loadingOptions,
        open,
        query,
        remoteMessage,
        selectOption,
        setActiveIndex,
        setOpen
    };
}
