export const weekDayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;
export const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hours = `${Math.floor(index / 2)}`.padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${hours}:${minutes}`;
});

export function isValidDateTimeInput(value: string): boolean {
    return !Number.isNaN(new Date(value).getTime());
}

export function getDateTimeDateValue(value: string): string {
    return value.split("T")[0] ?? "";
}

export function getDateTimeTimeValue(value: string): string {
    return value.split("T")[1]?.slice(0, 5) ?? "";
}

export function buildDateTimeInputValue(dateValue: string, timeValue: string): string {
    const normalizedDate = normalizeDateInputValue(dateValue);
    const normalizedTime = normalizeTimeInputValue(timeValue);

    if (!normalizedDate || !normalizedTime) {
        return "";
    }

    return `${normalizedDate}T${normalizedTime}`;
}

export function normalizeTimeInputValue(value: string): string {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
        return "";
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return "";
    }

    return `${hours}`.padStart(2, "0") + `:${`${minutes}`.padStart(2, "0")}`;
}

export function buildDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function buildDateTimeValue(date: Date): string {
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");

    return `${buildDateValue(date)}T${hours}:${minutes}`;
}

export function formatDateInputValue(value: string): string {
    return value ? value.replaceAll("-", "/") : "";
}

export function getCalendarBaseDate(value: string): Date {
    const normalized = normalizeDateInputValue(value);
    if (!normalized) {
        return new Date();
    }

    const [year, month, day] = normalized.split("-").map(Number);

    return new Date(year, month - 1, day);
}

export function normalizeDateInputValue(value: string): string {
    const match = value.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) {
        return "";
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return "";
    }

    return buildDateValue(date);
}

export function buildCalendarWeeks(displayDate: Date) {
    const firstDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 6 }, (_, weekIndex) =>
        Array.from({ length: 7 }, (_, dayIndex) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

            return date;
        })
    );
}
