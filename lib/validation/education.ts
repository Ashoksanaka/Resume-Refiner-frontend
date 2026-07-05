import { Education } from '@/types/api';
import {
    dateToMonthValue,
    monthValueToApiDate,
    normalizeApiDate,
    normalizeOptionalApiDate,
} from '@/lib/validation/dates';
import { isRegionComplete } from '@/lib/validation/region';

export { dateToMonthValue, monthValueToApiDate } from '@/lib/validation/dates';

export const DEGREE_LEVEL_OPTIONS = [
    "Bachelor's",
    "Master's",
    'Doctorate',
    'Diploma',
    'Associate',
    'High School',
    'Other',
] as const;

export const COURSE_OPTIONS = [
    'BTech',
    'BE',
    'MTech',
    'ME',
    'BSc',
    'MSc',
    'MBA',
    'BCA',
    'MCA',
    'BCom',
    'MCom',
    'BA',
    'MA',
    'PhD',
    'Other',
] as const;

export type DegreeLevel = (typeof DEGREE_LEVEL_OPTIONS)[number];
export type CourseOption = (typeof COURSE_OPTIONS)[number];
export type GradeType = 'percentage' | 'cgpa';

export function migrateLegacyEducation(education: Education[]): Education[] {
    return education.map((entry) => {
        if (entry.degree_level || !entry.degree?.trim()) {
            return entry;
        }

        return {
            ...entry,
            course: entry.course || entry.degree,
            degree_level: entry.degree_level || '',
        };
    });
}

export function normalizeEducationForApi(education: Education[]): Education[] {
    return education.map((entry) => {
        const normalized: Education = {
            ...entry,
            start_date: normalizeApiDate(entry.start_date),
            end_date: normalizeOptionalApiDate(entry.end_date),
        };

        if (normalized.degree) {
            delete normalized.degree;
        }

        return normalized;
    });
}

export function isCurrentlyStudying(education: Education): boolean {
    return education.end_date === null;
}

export interface EducationEntryErrors {
    institution?: string;
    degree_level?: string;
    degree_level_other?: string;
    course?: string;
    course_other?: string;
    specialization?: string;
    location?: string;
    grade_type?: string;
    grade_value?: string;
    start_date?: string;
    end_date?: string;
}

export type EducationFieldErrors = Record<number, EducationEntryErrors>;

function resolveDegreeLevelLabel(entry: Education): string {
    if (entry.degree_level === 'Other') {
        return entry.degree_level_other?.trim() || '';
    }
    return entry.degree_level?.trim() || '';
}

function resolveCourseLabel(entry: Education): string {
    if (entry.course === 'Other') {
        return entry.course_other?.trim() || '';
    }
    return entry.course?.trim() || '';
}

function validateGrade(entry: Education): string | undefined {
    if (!entry.grade_type) {
        return 'Select percentage or CGPA.';
    }

    const value = entry.grade_value;
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
        return 'Grade value is required.';
    }

    const numericValue = Number(value);
    if (entry.grade_type === 'percentage') {
        if (numericValue < 0 || numericValue > 100) {
            return 'Percentage must be between 0 and 100.';
        }
        return undefined;
    }

    if (numericValue < 0 || numericValue > 10) {
        return 'CGPA must be between 0 and 10.';
    }

    return undefined;
}

export function validateEducationEntries(education: Education[]): EducationFieldErrors {
    const errors: EducationFieldErrors = {};

    education.forEach((entry, index) => {
        const entryErrors: EducationEntryErrors = {};

        if (!entry.institution.trim()) {
            entryErrors.institution = 'Institute name is required.';
        }

        if (!entry.degree_level) {
            entryErrors.degree_level = 'Degree level is required.';
        } else if (entry.degree_level === 'Other' && !entry.degree_level_other?.trim()) {
            entryErrors.degree_level_other = 'Please specify the degree level.';
        }

        if (!entry.course) {
            entryErrors.course = 'Course is required.';
        } else if (entry.course === 'Other' && !entry.course_other?.trim()) {
            entryErrors.course_other = 'Please specify the course.';
        }

        if (!entry.specialization?.trim()) {
            entryErrors.specialization = 'Specialization is required.';
        }

        if (!isRegionComplete(entry.location || '')) {
            entryErrors.location = 'State and country are required.';
        }

        const gradeError = validateGrade(entry);
        if (gradeError) {
            entryErrors.grade_value = gradeError;
        }

        if (!dateToMonthValue(entry.start_date)) {
            entryErrors.start_date = 'Start month and year are required.';
        }

        if (!isCurrentlyStudying(entry) && !dateToMonthValue(entry.end_date || '')) {
            entryErrors.end_date = 'End month and year are required unless currently studying.';
        }

        if (Object.keys(entryErrors).length > 0) {
            errors[index] = entryErrors;
        }
    });

    return errors;
}

export function hasEducationErrors(errors: EducationFieldErrors): boolean {
    return Object.keys(errors).length > 0;
}

export function isEducationEntryComplete(entry: Education): boolean {
    return (
        Object.keys(validateEducationEntries([entry])).length === 0 &&
        Boolean(resolveDegreeLevelLabel(entry)) &&
        Boolean(resolveCourseLabel(entry))
    );
}

export function isEducationSectionComplete(education: Education[]): boolean {
    return education.length > 0 && education.every(isEducationEntryComplete);
}
