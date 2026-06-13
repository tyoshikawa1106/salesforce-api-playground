"use client";

import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { SearchResultItem } from "@/lib/salesforce/records";
import { apiRequest } from "../utils/api";
import { getContactName } from "../utils/formatting";

export function getGlobalSearchResultLabel(result: SearchResultItem): string {
    return result.type === "account" ? result.record.Name : getContactName(result.record);
}

export function useGlobalSearch({
    connected,
    onSelectSearchResult
}: {
    connected: boolean;
    onSelectSearchResult?: (result: SearchResultItem) => void;
}) {
    const searchRef = useRef<HTMLDivElement | null>(null);
    const searchRequestId = useRef(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [activeSearchIndex, setActiveSearchIndex] = useState(-1);

    function changeSearchQuery(event: ChangeEvent<HTMLInputElement>): void {
        setSearchQuery(event.target.value);
        setSearchOpen(true);
        setActiveSearchIndex(-1);
    }

    function selectSearchResult(result: SearchResultItem): void {
        onSelectSearchResult?.(result);
        setSearchQuery(getGlobalSearchResultLabel(result));
        setSearchOpen(false);
        setActiveSearchIndex(-1);
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (event.key === "Escape") {
            setSearchOpen(false);
            return;
        }

        if (!searchOpen || searchResults.length === 0) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveSearchIndex((currentIndex) => (currentIndex + 1) % searchResults.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveSearchIndex((currentIndex) =>
                currentIndex <= 0 ? searchResults.length - 1 : currentIndex - 1
            );
        } else if (event.key === "Enter" && activeSearchIndex >= 0) {
            event.preventDefault();
            selectSearchResult(searchResults[activeSearchIndex]);
        }
    }

    useEffect(() => {
        function closeOnPointerDown(event: PointerEvent): void {
            if (!searchRef.current?.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        }

        document.addEventListener("pointerdown", closeOnPointerDown);
        return () => document.removeEventListener("pointerdown", closeOnPointerDown);
    }, []);

    useEffect(() => {
        if (!connected) {
            searchRequestId.current += 1;
            setSearchQuery("");
            setSearchResults([]);
            setSearchMessage(null);
            setSearchLoading(false);
            setSearchOpen(false);
            return;
        }

        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            searchRequestId.current += 1;
            setSearchResults([]);
            setSearchMessage("検索キーワードを入力してください。");
            setSearchLoading(false);
            return;
        }

        if (trimmedQuery.length < 2) {
            searchRequestId.current += 1;
            setSearchResults([]);
            setSearchMessage("2 文字以上で検索してください。");
            setSearchLoading(false);
            return;
        }

        const requestId = searchRequestId.current + 1;
        searchRequestId.current = requestId;
        setSearchLoading(true);
        setSearchMessage(null);

        const timer = window.setTimeout(() => {
            apiRequest<{ results: SearchResultItem[] }>(
                buildPlaygroundApiRequest(playgroundApiPaths.search(trimmedQuery))
            )
                .then(({ results }) => {
                    if (searchRequestId.current !== requestId) {
                        return;
                    }

                    setSearchResults(results);
                    setSearchMessage(results.length === 0 ? "検索結果がありません。" : null);
                    setActiveSearchIndex(results.length > 0 ? 0 : -1);
                })
                .catch((error) => {
                    if (searchRequestId.current !== requestId) {
                        return;
                    }

                    setSearchResults([]);
                    setSearchMessage(error instanceof Error ? error.message : "検索に失敗しました。");
                    setActiveSearchIndex(-1);
                })
                .finally(() => {
                    if (searchRequestId.current === requestId) {
                        setSearchLoading(false);
                    }
                });
        }, 250);

        return () => {
            window.clearTimeout(timer);
        };
    }, [connected, searchQuery]);

    return {
        activeSearchIndex,
        changeSearchQuery,
        handleSearchKeyDown,
        searchLoading,
        searchMessage,
        searchOpen,
        searchQuery,
        searchRef,
        searchResults,
        selectSearchResult,
        setSearchOpen
    };
}
