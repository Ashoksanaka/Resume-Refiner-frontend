import { Profile } from '@/types/api';

export type ProfileSectionKey =
    | 'personalInfo'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'certifications'
    | 'projects'
    | 'achievements'
    | 'publications'
    | 'patents'
    | 'licenses'
    | 'trainings'
    | 'volunteering'
    | 'organizations'
    | 'positions'
    | 'career_breaks'
    | 'languages'
    | 'test_scores'
    | 'areas_of_interest'
    | 'hobbies';

export interface ProfileSectionOption {
    key: ProfileSectionKey;
    label: string;
}

export const PROFILE_SECTION_OPTIONS: ProfileSectionOption[] = [
    { key: 'personalInfo', label: 'Overview' },
    { key: 'summary', label: 'Summary' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'skills', label: 'Skills' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'projects', label: 'Projects' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'publications', label: 'Publications' },
    { key: 'patents', label: 'Patents' },
    { key: 'licenses', label: 'Licenses' },
    { key: 'trainings', label: 'Trainings' },
    { key: 'volunteering', label: 'Volunteering' },
    { key: 'organizations', label: 'Organizations' },
    { key: 'positions', label: 'Positions' },
    { key: 'career_breaks', label: 'Career Breaks' },
    { key: 'languages', label: 'Languages' },
    { key: 'test_scores', label: 'Test Scores' },
    { key: 'areas_of_interest', label: 'Areas of Interest' },
    { key: 'hobbies', label: 'Hobbies' },
];

export const RECOMMENDED_SECTION_KEYS: ProfileSectionKey[] = [
    'personalInfo',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
];

function hasNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

function hasNonEmptyArray(value: unknown): boolean {
    return Array.isArray(value) && value.length > 0;
}

function personalInfoHasData(profile: Profile): boolean {
    const info = profile.personalInfo;
    if (!info) return false;
    return Boolean(
            info.full_name?.trim() ||
            info.email?.trim() ||
            info.phone_number?.trim() ||
            info.location?.trim() ||
            info.portfolio_url?.trim()
    );
}

export function sectionHasData(profile: Profile, key: ProfileSectionKey): boolean {
    switch (key) {
        case 'personalInfo':
            return personalInfoHasData(profile);
        case 'summary':
            return hasNonEmptyString(profile.summary);
        case 'skills':
        case 'areas_of_interest':
        case 'hobbies':
            return hasNonEmptyArray(profile[key]);
        case 'experience':
        case 'education':
            return hasNonEmptyArray(profile[key]);
        case 'certifications':
            return hasNonEmptyArray(profile.certifications);
        case 'projects':
            return hasNonEmptyArray(profile.projects);
        case 'achievements':
            return hasNonEmptyArray(profile.achievements);
        case 'publications':
            return hasNonEmptyArray(profile.publications);
        case 'patents':
            return hasNonEmptyArray(profile.patents);
        case 'licenses':
            return hasNonEmptyArray(profile.licenses);
        case 'trainings':
            return hasNonEmptyArray(profile.trainings);
        case 'volunteering':
            return hasNonEmptyArray(profile.volunteering);
        case 'organizations':
            return hasNonEmptyArray(profile.organizations);
        case 'positions':
            return hasNonEmptyArray(profile.positions);
        case 'career_breaks':
            return hasNonEmptyArray(profile.career_breaks);
        case 'languages':
            return hasNonEmptyArray(profile.languages);
        case 'test_scores':
            return hasNonEmptyArray(profile.test_scores);
        default:
            return false;
    }
}

export function getPopulatedSections(profile: Profile): ProfileSectionOption[] {
    return PROFILE_SECTION_OPTIONS.filter((option) => sectionHasData(profile, option.key));
}

export function getDefaultSelectedSections(profile: Profile): Set<ProfileSectionKey> {
    const populated = new Set(getPopulatedSections(profile).map((s) => s.key));
    const defaults = RECOMMENDED_SECTION_KEYS.filter((key) => populated.has(key));
    return new Set(defaults);
}
