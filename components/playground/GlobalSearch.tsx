"use client";

import type { SearchResultItem } from "@/lib/salesforce/records";
import { getContactName } from "./formatting";
import { StandardIcon, UtilityIcon } from "./SldsIcon";
import { getGlobalSearchResultLabel, useGlobalSearch } from "./useGlobalSearch";

type GlobalSearchProps = {
    connected: boolean;
    onSelectSearchResult?: (result: SearchResultItem) => void;
};

function getResultMeta(result: SearchResultItem): string {
    if (result.type === "account") {
        return [result.record.BillingCity, result.record.BillingCountry, result.record.Phone]
            .filter(Boolean)
            .join(" / ") || "取引先";
    }

    return [result.record.Account?.Name, result.record.Title, result.record.Email]
        .filter(Boolean)
        .join(" / ") || "取引先責任者";
}

function getResultIconContainerClass(result: SearchResultItem): string {
    const objectIconClass = result.type === "account" ? "slds-icon-standard-account" : "slds-icon-standard-contact";

    return `slds-icon_container ${objectIconClass}`;
}

function SearchResultIcon({ result }: { result: SearchResultItem }) {
    const label = result.type === "account" ? "取引先" : "取引先責任者";
    const iconName = result.type === "account" ? "account" : "contact";

    return (
        <span className={getResultIconContainerClass(result)} title={label}>
            <StandardIcon className="slds-icon slds-icon_small" name={iconName} />
            <span className="slds-assistive-text">{label}</span>
        </span>
    );
}

export function GlobalSearch({ connected, onSelectSearchResult }: GlobalSearchProps) {
    const {
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
    } = useGlobalSearch({ connected, onSelectSearchResult });

    return (
        <div ref={searchRef} className={`slds-form-element slds-lookup ${searchOpen ? "slds-is-open" : "slds-is-close"}`}>
            <label className="slds-assistive-text" htmlFor="global-search">
                検索
            </label>
            <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left slds-global-search__form-element">
                <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true">
                    <UtilityIcon className="slds-icon slds-icon_x-small playground-global-search-icon" name="search" />
                </span>
                <input
                    id="global-search"
                    className="slds-input slds-lookup__search-input"
                    type="search"
                    placeholder="Salesforce を検索"
                    disabled={!connected}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="global-search-results"
                    aria-expanded={searchOpen}
                    aria-activedescendant={
                        searchOpen && activeSearchIndex >= 0
                            ? `global-search-result-${activeSearchIndex}`
                            : undefined
                    }
                    value={searchQuery}
                    onChange={changeSearchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>
            {connected && searchOpen ? (
                <div
                    id="global-search-results"
                    className="slds-lookup__menu slds-dropdown slds-dropdown_fluid playground-global-search-results"
                    role="listbox"
                    aria-label="検索候補"
                >
                    {searchLoading ? (
                        <div className="slds-lookup__item slds-p-around_small" role="status">
                            検索中...
                        </div>
                    ) : null}
                    {!searchLoading && searchResults.length > 0 ? (
                        <ul className="slds-listbox slds-listbox_vertical" role="presentation">
                            {searchResults.map((result, index) => (
                                <li
                                    key={`${result.type}-${result.record.Id}`}
                                    id={`global-search-result-${index}`}
                                    className={`slds-listbox__item playground-global-search-result ${
                                        activeSearchIndex === index ? "playground-global-search-result_active" : ""
                                    }`}
                                    role="option"
                                    aria-selected={activeSearchIndex === index}
                                >
                                    <button
                                        className="slds-button_reset slds-size_full slds-p-vertical_x-small slds-p-horizontal_small playground-global-search-result__button"
                                        type="button"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectSearchResult(result)}
                                    >
                                        <span className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta">
                                            <span className="slds-media__figure slds-listbox__option-icon">
                                                <SearchResultIcon result={result} />
                                            </span>
                                            <span className="slds-media__body">
                                                <span className="slds-listbox__option-text slds-listbox__option-text_entity playground-global-search-result__label">
                                                    {getGlobalSearchResultLabel(result)}
                                                </span>
                                                <span className="slds-listbox__option-meta slds-listbox__option-meta_entity playground-global-search-result__meta">
                                                    {result.type === "account" ? "取引先" : "取引先責任者"} / {getResultMeta(result)}
                                                </span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    {!searchLoading && searchMessage ? (
                        <div className="slds-lookup__item slds-p-around_small" role="status">
                            {searchMessage}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
