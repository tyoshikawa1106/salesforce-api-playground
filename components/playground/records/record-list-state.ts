"use client";

import { useEffect, useMemo, useState } from "react";

const getDefaultRecordId = <Record extends { Id: string }>(record: Record) => record.Id;

export function getSelectionState<Record extends { Id: string }>(visibleRecords: Record[], selectedIds: Set<string>) {
    return getSelectionStateForIds(visibleRecords.map((record) => record.Id), selectedIds);
}

export function getSelectionStateForIds(visibleIds: string[], selectedIds: Set<string>) {
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

    return {
        allVisibleSelected,
        someVisibleSelected: selectedVisibleCount > 0 && !allVisibleSelected,
        selectedVisibleCount
    };
}

export function useListSelectionState<Record>({
    availableRecords,
    visibleRecords,
    getRecordId
}: {
    availableRecords: Record[];
    visibleRecords: Record[];
    getRecordId: (record: Record) => string;
}) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const visibleIds = useMemo(() => visibleRecords.map(getRecordId), [visibleRecords, getRecordId]);
    const selectionState = getSelectionStateForIds(visibleIds, selectedIds);
    const selectedVisibleRecords = useMemo(
        () => visibleRecords.filter((record) => selectedIds.has(getRecordId(record))),
        [visibleRecords, selectedIds, getRecordId]
    );

    useEffect(() => {
        setSelectedIds((currentIds) => pruneSelection(currentIds, availableRecords.map(getRecordId)));
    }, [availableRecords, getRecordId]);

    return {
        selectedIds,
        selectedVisibleRecords,
        selectionState,
        toggleSelection: (recordId: string) => setSelectedIds((currentIds) => toggleSelectedId(currentIds, recordId)),
        clearSelection: () => setSelectedIds(new Set()),
        toggleVisibleSelection: () => setSelectedIds((currentIds) => toggleVisibleSelection(currentIds, visibleIds))
    };
}

export function useRecordListState<Record extends { Id: string }>(
    records: Record[],
    filterListRecords: (records: Record[], searchTerm: string) => Record[]
) {
    const [searchTerm, setSearchTerm] = useState("");
    const [openActionRecordId, setOpenActionRecordId] = useState<string | null>(null);
    const filteredRecords = useMemo(() => filterListRecords(records, searchTerm), [records, searchTerm, filterListRecords]);
    const {
        clearSelection,
        selectedIds,
        selectionState,
        toggleSelection,
        toggleVisibleSelection
    } = useListSelectionState({
        availableRecords: records,
        visibleRecords: filteredRecords,
        getRecordId: getDefaultRecordId
    });

    return {
        searchTerm,
        setSearchTerm: (nextSearchTerm: string) => {
            setSearchTerm(nextSearchTerm);
            clearSelection();
            setOpenActionRecordId(null);
        },
        selectedIds,
        selectionState,
        filteredRecords,
        openActionRecordId,
        hasRecords: records.length > 0,
        hasFilteredRecords: filteredRecords.length > 0,
        toggleSelection,
        clearSelection,
        closeActionMenu: () => setOpenActionRecordId(null),
        toggleActionMenu: (recordId: string) =>
            setOpenActionRecordId((currentRecordId) => (currentRecordId === recordId ? null : recordId)),
        toggleVisibleSelection
    };
}

export function filterRecords<Record>(
    records: Record[],
    searchTerm: string,
    getSearchValues: (record: Record) => Array<string | undefined>
) {
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

    if (!normalizedSearchTerm) {
        return records;
    }

    return records.filter((record) =>
        getSearchValues(record).some((value) => normalizeSearchTerm(value).includes(normalizedSearchTerm))
    );
}

export function filterAndSortRecords<Record>(
    records: Record[],
    searchTerm: string,
    getSearchValues: (record: Record) => Array<string | undefined>,
    getLabel: (record: Record) => string
) {
    return [...filterRecords(records, searchTerm, getSearchValues)]
        .sort((a, b) => getLabel(a).localeCompare(getLabel(b), "ja"));
}

export function getSelectedVisibleRecords<Record extends { Id: string }>(visibleRecords: Record[], selectedIds: Set<string>) {
    return visibleRecords.filter((record) => selectedIds.has(record.Id));
}

function normalizeSearchTerm(value?: string) {
    return (value || "").trim().toLocaleLowerCase();
}

function toggleSelectedId(selectedIds: Set<string>, id: string) {
    const nextIds = new Set(selectedIds);

    if (nextIds.has(id)) {
        nextIds.delete(id);
        return nextIds;
    }

    nextIds.add(id);
    return nextIds;
}

function toggleVisibleSelection(selectedIds: Set<string>, visibleIds: string[]) {
    const nextIds = new Set(selectedIds);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => nextIds.has(id));

    visibleIds.forEach((id) => {
        if (allVisibleSelected) {
            nextIds.delete(id);
            return;
        }

        nextIds.add(id);
    });

    return nextIds;
}

function pruneSelection(selectedIds: Set<string>, recordIds: string[]) {
    const availableIds = new Set(recordIds);
    const nextIds = new Set([...selectedIds].filter((id) => availableIds.has(id)));

    return nextIds.size === selectedIds.size ? selectedIds : nextIds;
}
