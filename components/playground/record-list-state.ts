"use client";

import { useEffect, useMemo, useState } from "react";

export function getSelectionState<Record extends { Id: string }>(visibleRecords: Record[], selectedIds: Set<string>) {
    const visibleIds = visibleRecords.map((record) => record.Id);
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

    return {
        allVisibleSelected,
        someVisibleSelected: selectedVisibleCount > 0 && !allVisibleSelected,
        selectedVisibleCount
    };
}

export function useRecordListState<Record extends { Id: string }>(
    records: Record[],
    filterListRecords: (records: Record[], searchTerm: string) => Record[]
) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [openActionRecordId, setOpenActionRecordId] = useState<string | null>(null);
    const filteredRecords = useMemo(() => filterListRecords(records, searchTerm), [records, searchTerm, filterListRecords]);
    const selectionState = getSelectionState(filteredRecords, selectedIds);

    useEffect(() => {
        setSelectedIds((currentIds) => pruneSelection(currentIds, records.map((record) => record.Id)));
    }, [records]);

    return {
        searchTerm,
        setSearchTerm: (nextSearchTerm: string) => {
            setSearchTerm(nextSearchTerm);
            setSelectedIds(new Set());
            setOpenActionRecordId(null);
        },
        selectedIds,
        selectionState,
        filteredRecords,
        openActionRecordId,
        hasRecords: records.length > 0,
        hasFilteredRecords: filteredRecords.length > 0,
        toggleSelection: (recordId: string) => setSelectedIds((currentIds) => toggleSelectedId(currentIds, recordId)),
        clearSelection: () => setSelectedIds(new Set()),
        closeActionMenu: () => setOpenActionRecordId(null),
        toggleActionMenu: (recordId: string) =>
            setOpenActionRecordId((currentRecordId) => (currentRecordId === recordId ? null : recordId)),
        toggleVisibleSelection: () =>
            setSelectedIds((currentIds) => toggleVisibleSelection(currentIds, filteredRecords.map((record) => record.Id)))
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
