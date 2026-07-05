import { Experience } from '@/types/api';
import {
    dateToMonthValue,
    monthValueToApiDate,
    normalizeApiDate,
    normalizeOptionalApiDate,
} from '@/lib/validation/dates';

export { dateToMonthValue, monthValueToApiDate } from '@/lib/validation/dates';

export function normalizeExperienceForApi(experience: Experience): Experience {
    return {
        ...experience,
        start_date: normalizeApiDate(experience.start_date),
        end_date: normalizeOptionalApiDate(experience.end_date),
    };
}

export function isCurrentlyWorking(experience: Experience): boolean {
    return experience.end_date === null;
}

export interface ExperienceEntryErrors {
    company?: string;
    title?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

export type ExperienceFieldErrors = Record<number, ExperienceEntryErrors>;

export function validateExperienceEntries(experience: Experience[]): ExperienceFieldErrors {
    const errors: ExperienceFieldErrors = {};

    experience.forEach((entry, index) => {
        const entryErrors: ExperienceEntryErrors = {};

        if (!entry.company.trim()) {
            entryErrors.company = 'Company is required.';
        }

        if (!entry.title.trim()) {
            entryErrors.title = 'Title is required.';
        }

        if (!dateToMonthValue(entry.start_date)) {
            entryErrors.start_date = 'Start month and year are required.';
        }

        if (!entry.description?.trim()) {
            entryErrors.description = 'Description is required.';
        }

        if (!isCurrentlyWorking(entry) && !dateToMonthValue(entry.end_date || '')) {
            entryErrors.end_date = 'End month and year are required unless currently working.';
        }

        if (Object.keys(entryErrors).length > 0) {
            errors[index] = entryErrors;
        }
    });

    return errors;
}

export function hasExperienceErrors(errors: ExperienceFieldErrors): boolean {
    return Object.keys(errors).length > 0;
}
