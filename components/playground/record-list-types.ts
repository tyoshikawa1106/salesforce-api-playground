import type { ReactNode } from "react";

export type RecordListColumn<Record> = {
    label: string;
    getValue: (record: Record) => ReactNode;
};

export type RecordListMessages = {
    loading: string;
    empty: string;
    disconnected: string;
    filteredEmpty: string;
};
