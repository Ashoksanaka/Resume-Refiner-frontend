import {
    Achievement,
    CareerBreak,
    CareerBreakReason,
    Language,
    LanguageProficiencyLevel,
    License,
    Organization,
    Patent,
    Position,
    Profile,
    Project,
    Publication,
    PublicationAuthor,
    TestScore,
    Training,
    Volunteering,
} from '@/types/api';
import { dateToMonthValue, normalizeApiDate, normalizeOptionalApiDate } from '@/lib/validation/dates';
import { migrateLegacyEducation } from '@/lib/validation/education';

const LEGACY_PROFICIENCY_MAP: Record<string, LanguageProficiencyLevel> = {
    native: 'native',
    full_professional: 'professional',
    limited_professional: 'conversational',
    conversational: 'conversational',
    basic: 'basic',
};

function mapLegacyProficiency(value?: string): LanguageProficiencyLevel {
    if (!value) {
        return 'conversational';
    }
    return LEGACY_PROFICIENCY_MAP[value] || 'conversational';
}

function migratePublicationAuthors(authors: unknown): PublicationAuthor[] {
    if (!Array.isArray(authors)) {
        return [];
    }
    return authors.map((author, index) => {
        if (typeof author === 'string') {
            return { name: author, order: index + 1 };
        }
        if (author && typeof author === 'object' && 'name' in author) {
            return author as PublicationAuthor;
        }
        return { name: String(author), order: index + 1 };
    });
}

export function migratePublication(pub: Publication): Publication {
    return {
        ...pub,
        authors: migratePublicationAuthors(pub.authors),
        keywords: pub.keywords || [],
        subject_categories: pub.subject_categories || [],
        funding_sources: pub.funding_sources || [],
        grant_numbers: pub.grant_numbers || [],
    };
}

export function migrateLanguage(entry: Language): Language {
    if (entry.read_proficiency && entry.write_proficiency && entry.speak_proficiency) {
        return entry;
    }
    const mapped = mapLegacyProficiency(entry.proficiency);
    return {
        ...entry,
        read_proficiency: entry.read_proficiency || mapped,
        write_proficiency: entry.write_proficiency || mapped,
        speak_proficiency: entry.speak_proficiency || mapped,
    };
}

export function migrateLicense(entry: License): License {
    if (entry.awarded_date || !entry.date) {
        return entry;
    }
    return {
        ...entry,
        awarded_date: entry.date,
    };
}

export function migrateCareerBreak(entry: CareerBreak & { title?: string }): CareerBreak {
    if (entry.reason) {
        return entry;
    }
    return {
        ...entry,
        reason: 'other',
        description: entry.description || entry.title || '',
    };
}

export function migrateProfile(data: Profile): Profile {
    return {
        ...data,
        education: migrateLegacyEducation(data.education || []),
        projects: (data.projects || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
            technologies: entry.technologies || [],
            ongoing: entry.ongoing ?? entry.end_date === null,
        })),
        achievements: (data.achievements || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
        })),
        publications: (data.publications || []).map(migratePublication),
        patents: (data.patents || []).map((entry) => ({
            ...entry,
            keywords: entry.keywords || [],
            inventors: entry.inventors || [],
            applicants: entry.applicants || [],
            assignees: entry.assignees || [],
            ipc_codes: entry.ipc_codes || [],
            cpc_codes: entry.cpc_codes || [],
            us_classifications: entry.us_classifications || [],
            publication_languages: entry.publication_languages || [],
        })),
        licenses: (data.licenses || []).map(migrateLicense),
        trainings: (data.trainings || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
        })),
        volunteering: (data.volunteering || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
        })),
        organizations: (data.organizations || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
        })),
        positions: (data.positions || []).map((entry) => ({
            ...entry,
            description: entry.description || '',
        })),
        career_breaks: (data.career_breaks || []).map((entry) =>
            migrateCareerBreak(entry as CareerBreak & { title?: string })
        ),
        languages: (data.languages || []).map(migrateLanguage),
    };
}

export type SectionFieldErrors = Record<number, Record<string, string>>;

function hasEntryErrors(errors: SectionFieldErrors): boolean {
    return Object.keys(errors).length > 0;
}

function validateRequiredText(value: string | undefined, message: string): string | undefined {
    return value?.trim() ? undefined : message;
}

function validateMonthDate(value: string | undefined | null, message: string): string | undefined {
    return dateToMonthValue(value || '') ? undefined : message;
}

function validateDuration(
    startDate: string | undefined | null,
    endDate: string | null | undefined,
    ongoing: boolean
): { start_date?: string; end_date?: string } {
    const errors: { start_date?: string; end_date?: string } = {};
    if (!dateToMonthValue(startDate || '')) {
        errors.start_date = 'Start month and year are required.';
    }
    if (!ongoing && !dateToMonthValue(endDate || '')) {
        errors.end_date = 'End month and year are required unless currently ongoing.';
    }
    return errors;
}

export function validateProjects(projects: Project[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    projects.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.role.trim()) entryErrors.role = 'Role is required.';
        if (!entry.description?.trim()) entryErrors.description = 'Description is required.';
        Object.assign(
            entryErrors,
            validateDuration(entry.start_date, entry.ongoing ? null : entry.end_date, entry.ongoing)
        );
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateAchievements(achievements: Achievement[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    achievements.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.description?.trim()) entryErrors.description = 'Description is required.';
        if (!dateToMonthValue(entry.date || '')) entryErrors.date = 'Month and year are required.';
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateLicenses(licenses: License[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    licenses.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.name.trim()) entryErrors.name = 'Name is required.';
        if (!entry.issuer.trim()) entryErrors.issuer = 'Issuer is required.';
        if (!dateToMonthValue(entry.awarded_date || entry.date || '')) {
            entryErrors.awarded_date = 'Awarded date is required.';
        }
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateTrainings(trainings: Training[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    trainings.forEach((entry, index) => {
        const ongoing = entry.end_date === null;
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.provider.trim()) entryErrors.provider = 'Provider is required.';
        if (!entry.description?.trim()) entryErrors.description = 'Description is required.';
        Object.assign(entryErrors, validateDuration(entry.start_date, entry.end_date, ongoing));
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

function validateTimedRoleEntry(
    entry: {
        start_date?: string | null;
        end_date?: string | null;
        description?: string;
    },
    labels: { description: string }
): Record<string, string> {
    const ongoing = entry.end_date === null;
    const entryErrors: Record<string, string> = validateDuration(
        entry.start_date,
        entry.end_date,
        ongoing
    );
    const descriptionError = validateRequiredText(entry.description, labels.description);
    if (descriptionError) entryErrors.description = descriptionError;
    return entryErrors;
}

export function validateVolunteering(items: Volunteering[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.organization.trim()) entryErrors.organization = 'Organization is required.';
        if (!entry.role.trim()) entryErrors.role = 'Role is required.';
        Object.assign(
            entryErrors,
            validateTimedRoleEntry(entry, { description: 'Description is required.' })
        );
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateOrganizations(items: Organization[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.name.trim()) entryErrors.name = 'Name is required.';
        if (!entry.role.trim()) entryErrors.role = 'Role is required.';
        Object.assign(
            entryErrors,
            validateTimedRoleEntry(entry, { description: 'Description is required.' })
        );
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validatePositions(items: Position[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.organization.trim()) entryErrors.organization = 'Organization is required.';
        Object.assign(
            entryErrors,
            validateTimedRoleEntry(entry, { description: 'Description is required.' })
        );
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateCareerBreaks(items: CareerBreak[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const ongoing = entry.end_date === null;
        const entryErrors: Record<string, string> = {};
        if (!entry.reason) entryErrors.reason = 'Reason is required.';
        if (!entry.description?.trim()) entryErrors.description = 'Description is required.';
        Object.assign(entryErrors, validateDuration(entry.start_date, entry.end_date, ongoing));
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateTestScores(items: TestScore[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.test_name.trim()) entryErrors.test_name = 'Test name is required.';
        if (entry.score === '' || entry.score === null || entry.score === undefined) {
            entryErrors.score = 'Score is required.';
        }
        if (!dateToMonthValue(entry.date || '')) entryErrors.date = 'Test date is required.';
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateLanguages(items: Language[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.language.trim()) entryErrors.language = 'Language is required.';
        if (!entry.read_proficiency) entryErrors.read_proficiency = 'Read proficiency is required.';
        if (!entry.write_proficiency) entryErrors.write_proficiency = 'Write proficiency is required.';
        if (!entry.speak_proficiency) entryErrors.speak_proficiency = 'Speak proficiency is required.';
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validatePublications(items: Publication[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.authors?.length || !entry.authors[0]?.name?.trim()) {
            entryErrors.authors = 'At least one author is required.';
        }
        if (!entry.venue?.trim()) entryErrors.venue = 'Journal or conference name is required.';
        if (!dateToMonthValue(entry.date || '')) entryErrors.date = 'Publication date is required.';
        if (!entry.doi?.trim() && !entry.url?.trim()) {
            entryErrors.doi = 'Provide a DOI or URL.';
        }
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validatePatents(items: Patent[]): SectionFieldErrors {
    const errors: SectionFieldErrors = {};
    items.forEach((entry, index) => {
        const entryErrors: Record<string, string> = {};
        if (!entry.title.trim()) entryErrors.title = 'Title is required.';
        if (!entry.patent_number.trim()) entryErrors.patent_number = 'Patent number is required.';
        if (!entry.abstract?.trim()) entryErrors.abstract = 'Abstract is required.';
        if (!entry.inventors?.length) entryErrors.inventors = 'At least one inventor is required.';
        if (Object.keys(entryErrors).length > 0) errors[index] = entryErrors;
    });
    return errors;
}

export function validateStringTags(values: string[], label: string): string | undefined {
    const cleaned = values.map((value) => value.trim()).filter(Boolean);
    if (cleaned.length === 0) {
        return `${label} must include at least one entry.`;
    }
    return undefined;
}

export function normalizeProjects(projects: Project[]): Project[] {
    return projects.map((entry) => ({
        ...entry,
        start_date: normalizeApiDate(entry.start_date),
        end_date: entry.ongoing ? null : normalizeOptionalApiDate(entry.end_date),
        technologies: entry.technologies || [],
    }));
}

export function normalizeTimedEntries<T extends { start_date?: string | null; end_date?: string | null }>(
    entries: T[]
): T[] {
    return entries.map((entry) => ({
        ...entry,
        start_date: normalizeApiDate(entry.start_date),
        end_date: normalizeOptionalApiDate(entry.end_date),
    }));
}

export function normalizeMonthOnlyEntries<T extends { date?: string | null }>(entries: T[]): T[] {
    return entries.map((entry) => ({
        ...entry,
        date: entry.date ? normalizeApiDate(entry.date) : entry.date,
    }));
}

function normalizeOptionalMonth(date?: string | null): string | null | undefined {
    if (date === null) {
        return null;
    }
    if (!date) {
        return date;
    }
    return normalizeApiDate(date);
}

export function normalizePublicationEntries(publications: Publication[]): Publication[] {
    return publications.map((entry) => ({
        ...entry,
        date: normalizeOptionalMonth(entry.date),
        online_date: normalizeOptionalMonth(entry.online_date),
        accepted_date: normalizeOptionalMonth(entry.accepted_date),
        version_date: normalizeOptionalMonth(entry.version_date),
    }));
}

export function normalizePatentEntries(patents: Patent[]): Patent[] {
    return patents.map((entry) => ({
        ...entry,
        filing_date: normalizeOptionalMonth(entry.filing_date),
        priority_date: normalizeOptionalMonth(entry.priority_date),
        publication_date: normalizeOptionalMonth(entry.publication_date),
        grant_date: normalizeOptionalMonth(entry.grant_date),
    }));
}

export function normalizeLicenses(licenses: License[]): License[] {
    return licenses.map((entry) => ({
        ...entry,
        awarded_date: normalizeApiDate(entry.awarded_date || entry.date),
        expiration_date: entry.expiration_date ? normalizeApiDate(entry.expiration_date) : entry.expiration_date,
    }));
}

export { hasEntryErrors };

export const CAREER_BREAK_REASONS: { value: CareerBreakReason; label: string }[] = [
    { value: 'parental', label: 'Parental leave' },
    { value: 'health', label: 'Health' },
    { value: 'travel', label: 'Travel' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
];

export function isProjectComplete(entry: Project): boolean {
    return Object.keys(validateProjects([entry])).length === 0;
}

export function isAchievementComplete(entry: Achievement): boolean {
    return Object.keys(validateAchievements([entry])).length === 0;
}

export function isLanguageComplete(entry: Language): boolean {
    return Object.keys(validateLanguages([entry])).length === 0;
}

export function isPublicationComplete(entry: Publication): boolean {
    return Object.keys(validatePublications([entry])).length === 0;
}

export function isPatentComplete(entry: Patent): boolean {
    return Object.keys(validatePatents([entry])).length === 0;
}

export function isTimedRoleComplete(
    entry: { start_date?: string | null; end_date?: string | null; description?: string },
    validator: (items: Volunteering[]) => SectionFieldErrors
): boolean {
    return Object.keys(validator([entry as Volunteering])).length === 0;
}
