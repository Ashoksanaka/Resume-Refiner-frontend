import { PersonalInfo } from '@/types/api';

export const PHONE_NUMBER_PATTERN = /^\+\d{1,4}-\d{6,14}$/;

export function isValidPhoneNumber(value: string): boolean {
    return PHONE_NUMBER_PATTERN.test(value);
}

export function sanitizePhoneInput(value: string): string {
    const hasLeadingPlus = value.startsWith('+');
    const digitsAndHyphen = value.replace(/[^\d-]/g, '');
    const hyphenIndex = digitsAndHyphen.indexOf('-');
    if (hyphenIndex === -1) {
        return hasLeadingPlus ? `+${digitsAndHyphen}` : digitsAndHyphen;
    }
    const before = digitsAndHyphen.slice(0, hyphenIndex).replace(/-/g, '');
    const after = digitsAndHyphen.slice(hyphenIndex + 1).replace(/-/g, '');
    return hasLeadingPlus ? `+${before}-${after}` : `${before}-${after}`;
}

export interface PersonalInfoFieldErrors {
    full_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
}

export function validatePersonalInfo(
    personalInfo: PersonalInfo,
    options?: { locationSelected?: boolean }
): PersonalInfoFieldErrors {
    const errors: PersonalInfoFieldErrors = {};

    if (!personalInfo.full_name?.trim()) {
        errors.full_name = 'Full name is required.';
    }

    if (!personalInfo.email?.trim()) {
        errors.email = 'Email is required.';
    }

    if (!personalInfo.phone_number?.trim()) {
        errors.phone_number = 'Phone number is required.';
    } else if (!isValidPhoneNumber(personalInfo.phone_number)) {
        errors.phone_number =
            'Use format +<countryCode>-<number> (e.g. +91-9876543210).';
    }

    if (options?.locationSelected === false || !personalInfo.location?.trim()) {
        errors.location = 'Please select country, state, and city.';
    }

    return errors;
}

export function hasPersonalInfoErrors(errors: PersonalInfoFieldErrors): boolean {
    return Object.keys(errors).length > 0;
}

export const SUMMARY_MIN_LENGTH = 10;

export function validateProfileSummary(summary: string): string | undefined {
    if (!summary?.trim()) {
        return 'Professional summary is required.';
    }
    if (summary.trim().length < SUMMARY_MIN_LENGTH) {
        return `Professional summary must be at least ${SUMMARY_MIN_LENGTH} characters.`;
    }
    return undefined;
}
