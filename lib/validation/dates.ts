export function dateToMonthValue(date: string | null | undefined): string {
    if (!date) {
        return '';
    }
    const match = date.match(/^(\d{4}-\d{2})/);
    return match ? match[1] : '';
}

export function monthValueToApiDate(monthValue: string): string {
    if (!monthValue) {
        return '';
    }
    return `${monthValue}-01`;
}

export function normalizeApiDate(date: string | null | undefined): string {
    if (!date) {
        return '';
    }
    return monthValueToApiDate(dateToMonthValue(date));
}

export function normalizeOptionalApiDate(date: string | null | undefined): string | null {
    if (date === null) {
        return null;
    }
    if (!date) {
        return '';
    }
    return monthValueToApiDate(dateToMonthValue(date));
}
