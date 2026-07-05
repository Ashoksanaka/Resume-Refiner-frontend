'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { profileApi, ApiClientError } from '@/services/apiClient';
import {
    Profile,
    PersonalInfo,
    Experience,
    Education,
    Certification,
} from '@/types/api';
import {
    Button,
    Input,
    Textarea,
    Loading,
    ErrorDisplay,
    ConfirmDialog,
    Select,
} from '@/components/ui';
import { LocationPicker, isLocationComplete } from '@/components/profile/LocationPicker';
import { RegionPicker } from '@/components/profile/RegionPicker';
import { ProfileSectionCard, ProfileSectionFieldset } from '@/components/profile/ProfileSectionCard';
import {
    hasPersonalInfoErrors,
    sanitizePhoneInput,
    validatePersonalInfo,
    validateProfileSummary,
    PersonalInfoFieldErrors,
} from '@/lib/validation/personalInfo';
import {
    dateToMonthValue,
    ExperienceFieldErrors,
    hasExperienceErrors,
    isCurrentlyWorking,
    monthValueToApiDate,
    normalizeExperienceForApi,
    validateExperienceEntries,
} from '@/lib/validation/experience';
import {
    COURSE_OPTIONS,
    DEGREE_LEVEL_OPTIONS,
    EducationFieldErrors,
    hasEducationErrors,
    isCurrentlyStudying,
    normalizeEducationForApi,
    validateEducationEntries,
} from '@/lib/validation/education';
import {
    hasEntryErrors,
    migrateProfile,
    normalizePublicationEntries,
    normalizePatentEntries,
    normalizeLicenses,
    normalizeMonthOnlyEntries,
    normalizeProjects,
    normalizeTimedEntries,
    validateAchievements,
    validateCareerBreaks,
    validateLanguages,
    validateLicenses,
    validateOrganizations,
    validatePatents,
    validatePositions,
    validateProjects,
    validatePublications,
    validateStringTags,
    validateTestScores,
    validateTrainings,
    validateVolunteering,
} from '@/lib/validation/profileSections';
import {
    ExtendedProfileSections,
    ProfileSectionKey as ExtendedProfileSectionKey,
} from '@/components/profile/ExtendedProfileSections';
import styles from './page.module.css';

// -------------------------------------------------
// Empty State Helpers
// -------------------------------------------------

const emptyProfile: Profile = {
    personalInfo: {
        full_name: '',
        email: '',
        phone_number: '',
        location: '',
        portfolio_url: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    achievements: [],
    publications: [],
    patents: [],
    volunteering: [],
    licenses: [],
    trainings: [],
    test_scores: [],
    languages: [],
    organizations: [],
    positions: [],
    career_breaks: [],
    areas_of_interest: [],
    hobbies: [],
};

const emptyExperience: Experience = {
    company: '',
    title: '',
    start_date: '',
    end_date: '',
    description: '',
};

const emptyEducation: Education = {
    institution: '',
    degree_level: '',
    course: '',
    specialization: '',
    location: '',
    grade_type: '',
    start_date: '',
    end_date: '',
};

const emptyCertification: Certification = {
    name: '',
    issuing_organization: '',
    issue_date: '',
};

// -------------------------------------------------
// Section Helpers
// -------------------------------------------------

type ProfileSectionKey =
    | 'personalInfo'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
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

const SECTION_IDS: Record<ProfileSectionKey, string> = {
    personalInfo: 'personal',
    summary: 'summary',
    experience: 'experience',
    education: 'education',
    skills: 'skills',
    projects: 'projects',
    achievements: 'achievements',
    publications: 'publications',
    patents: 'patents',
    licenses: 'licenses',
    trainings: 'trainings',
    volunteering: 'volunteering',
    organizations: 'organizations',
    positions: 'positions',
    career_breaks: 'career_breaks',
    languages: 'languages',
    test_scores: 'test_scores',
    areas_of_interest: 'areas_of_interest',
    hobbies: 'hobbies',
};

// -------------------------------------------------
// Main Component
// -------------------------------------------------

export default function ProfilePage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const [profile, setProfile] = useState<Profile>(emptyProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [fieldErrors, setFieldErrors] = useState<PersonalInfoFieldErrors>({});
    const [summaryError, setSummaryError] = useState<string | undefined>();
    const [editingSections, setEditingSections] = useState<Set<ProfileSectionKey>>(new Set());
    const [sectionSnapshots, setSectionSnapshots] = useState<Partial<Record<ProfileSectionKey, unknown>>>({});
    const [savingSection, setSavingSection] = useState<ProfileSectionKey | null>(null);
    const [sectionSaveSuccess, setSectionSaveSuccess] = useState<ProfileSectionKey | null>(null);
    const [experienceFieldErrors, setExperienceFieldErrors] = useState<ExperienceFieldErrors>({});
    const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
    const [educationFieldErrors, setEducationFieldErrors] = useState<EducationFieldErrors>({});
    const [educationToDelete, setEducationToDelete] = useState<number | null>(null);
    const [sectionFieldErrors, setSectionFieldErrors] = useState<
        Partial<Record<ProfileSectionKey, Record<number, Record<string, string>>>>
    >({});
    const [sectionDeleteTarget, setSectionDeleteTarget] = useState<{
        section: ExtendedProfileSectionKey;
        index: number;
    } | null>(null);

    const clerkEmail = user?.primaryEmailAddress?.emailAddress || '';

    useEffect(() => {
        if (!clerkEmail) {
            return;
        }

        setProfile((prev) => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                email: clerkEmail,
            },
        }));
    }, [clerkEmail]);

    // Fetch profile once Clerk auth is ready
    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (!isSignedIn) {
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await profileApi.get();
                setProfile(migrateProfile(data));
            } catch (err) {
                if (err instanceof ApiClientError && err.status === 404) {
                    // Profile doesn't exist yet, use empty profile
                } else {
                    setError(err as Error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [isLoaded, isSignedIn]);

    const isSectionEditing = (section: ProfileSectionKey) => editingSections.has(section);

    const getSectionSnapshot = (section: ProfileSectionKey) => {
        if (section === 'personalInfo') {
            return structuredClone(profile.personalInfo);
        }
        return structuredClone(profile[section]);
    };

    const restoreSectionData = (section: ProfileSectionKey, snapshot: unknown) => {
        if (section === 'personalInfo') {
            setProfile((prev) => ({
                ...prev,
                personalInfo: snapshot as PersonalInfo,
            }));
            return;
        }

        setProfile((prev) => ({
            ...prev,
            [section]: snapshot,
        }));
    };

    const startSectionEdit = (section: ProfileSectionKey) => {
        setSectionSnapshots((prev) => ({
            ...prev,
            [section]: getSectionSnapshot(section),
        }));
        setEditingSections((prev) => new Set(prev).add(section));
    };

    const cancelSectionEdit = (section: ProfileSectionKey) => {
        const snapshot = sectionSnapshots[section];
        if (snapshot !== undefined) {
            restoreSectionData(section, snapshot);
        }
        setEditingSections((prev) => {
            const next = new Set(prev);
            next.delete(section);
            return next;
        });
        if (section === 'personalInfo') {
            setFieldErrors({});
        }
        if (section === 'summary') {
            setSummaryError(undefined);
        }
        if (section === 'experience') {
            setExperienceFieldErrors({});
        }
        if (section === 'education') {
            setEducationFieldErrors({});
        }
        if (
            section === 'projects' ||
            section === 'achievements' ||
            section === 'publications' ||
            section === 'patents' ||
            section === 'licenses' ||
            section === 'trainings' ||
            section === 'volunteering' ||
            section === 'organizations' ||
            section === 'positions' ||
            section === 'career_breaks' ||
            section === 'languages' ||
            section === 'test_scores'
        ) {
            setSectionFieldErrors((prev) => {
                const next = { ...prev };
                delete next[section];
                return next;
            });
        }
    };

    const getSectionPayload = (section: ProfileSectionKey): Partial<Profile> => {
        if (section === 'personalInfo') {
            return {
                personalInfo: {
                    ...profile.personalInfo,
                    email: clerkEmail || profile.personalInfo.email,
                },
            };
        }
        if (section === 'experience') {
            return {
                experience: profile.experience.map(normalizeExperienceForApi),
            };
        }
        if (section === 'education') {
            return {
                education: normalizeEducationForApi(profile.education),
            };
        }
        if (section === 'projects') {
            return { projects: normalizeProjects(profile.projects || []) };
        }
        if (section === 'achievements') {
            return { achievements: normalizeMonthOnlyEntries(profile.achievements || []) };
        }
        if (section === 'volunteering') {
            return { volunteering: normalizeTimedEntries(profile.volunteering || []) };
        }
        if (section === 'organizations') {
            return { organizations: normalizeTimedEntries(profile.organizations || []) };
        }
        if (section === 'positions') {
            return { positions: normalizeTimedEntries(profile.positions || []) };
        }
        if (section === 'trainings') {
            return { trainings: normalizeTimedEntries(profile.trainings || []) };
        }
        if (section === 'career_breaks') {
            return { career_breaks: normalizeTimedEntries(profile.career_breaks || []) };
        }
        if (section === 'licenses') {
            return { licenses: normalizeLicenses(profile.licenses || []) };
        }
        if (section === 'test_scores') {
            return { test_scores: normalizeMonthOnlyEntries(profile.test_scores || []) };
        }
        if (section === 'publications') {
            return { publications: normalizePublicationEntries(profile.publications || []) };
        }
        if (section === 'patents') {
            return { patents: normalizePatentEntries(profile.patents || []) };
        }
        return { [section]: profile[section] };
    };

    const validateSection = (section: ProfileSectionKey): boolean => {
        if (section === 'personalInfo') {
            const personalInfoForSave = {
                ...profile.personalInfo,
                email: clerkEmail || profile.personalInfo.email,
            };
            const validationErrors = validatePersonalInfo(personalInfoForSave, {
                locationSelected: isLocationComplete(personalInfoForSave.location),
            });

            if (hasPersonalInfoErrors(validationErrors)) {
                setFieldErrors(validationErrors);
                return false;
            }

            setFieldErrors({});
            return true;
        }

        if (section === 'summary') {
            const summaryValidationError = validateProfileSummary(profile.summary);
            if (summaryValidationError) {
                setSummaryError(summaryValidationError);
                return false;
            }

            setSummaryError(undefined);
            return true;
        }

        if (section === 'experience') {
            const validationErrors = validateExperienceEntries(profile.experience);
            if (hasExperienceErrors(validationErrors)) {
                setExperienceFieldErrors(validationErrors);
                return false;
            }

            setExperienceFieldErrors({});
            return true;
        }

        if (section === 'education') {
            const validationErrors = validateEducationEntries(profile.education);
            if (hasEducationErrors(validationErrors)) {
                setEducationFieldErrors(validationErrors);
                return false;
            }

            setEducationFieldErrors({});
            return true;
        }

        const runListValidation = (
            key: ProfileSectionKey,
            errors: Record<number, Record<string, string>>
        ) => {
            if (hasEntryErrors(errors)) {
                setSectionFieldErrors((prev) => ({ ...prev, [key]: errors }));
                return false;
            }
            setSectionFieldErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            return true;
        };

        if (section === 'projects') {
            return runListValidation('projects', validateProjects(profile.projects || []));
        }
        if (section === 'achievements') {
            return runListValidation('achievements', validateAchievements(profile.achievements || []));
        }
        if (section === 'publications') {
            return runListValidation('publications', validatePublications(profile.publications || []));
        }
        if (section === 'patents') {
            return runListValidation('patents', validatePatents(profile.patents || []));
        }
        if (section === 'licenses') {
            return runListValidation('licenses', validateLicenses(profile.licenses || []));
        }
        if (section === 'trainings') {
            return runListValidation('trainings', validateTrainings(profile.trainings || []));
        }
        if (section === 'volunteering') {
            return runListValidation('volunteering', validateVolunteering(profile.volunteering || []));
        }
        if (section === 'organizations') {
            return runListValidation('organizations', validateOrganizations(profile.organizations || []));
        }
        if (section === 'positions') {
            return runListValidation('positions', validatePositions(profile.positions || []));
        }
        if (section === 'career_breaks') {
            return runListValidation('career_breaks', validateCareerBreaks(profile.career_breaks || []));
        }
        if (section === 'languages') {
            return runListValidation('languages', validateLanguages(profile.languages || []));
        }
        if (section === 'test_scores') {
            return runListValidation('test_scores', validateTestScores(profile.test_scores || []));
        }
        if (section === 'areas_of_interest') {
            const tagError = validateStringTags(profile.areas_of_interest || [], 'Areas of interest');
            if (tagError) {
                setSectionFieldErrors((prev) => ({ ...prev, areas_of_interest: { 0: { tags: tagError } } }));
                return false;
            }
            setSectionFieldErrors((prev) => {
                const next = { ...prev };
                delete next.areas_of_interest;
                return next;
            });
            return true;
        }
        if (section === 'hobbies') {
            const tagError = validateStringTags(profile.hobbies || [], 'Hobbies');
            if (tagError) {
                setSectionFieldErrors((prev) => ({ ...prev, hobbies: { 0: { tags: tagError } } }));
                return false;
            }
            setSectionFieldErrors((prev) => {
                const next = { ...prev };
                delete next.hobbies;
                return next;
            });
            return true;
        }

        return true;
    };

    const saveSection = async (section: ProfileSectionKey) => {
        if (!validateSection(section)) {
            return;
        }

        setError(null);
        setSavingSection(section);

        try {
            const updated = await profileApi.update(getSectionPayload(section));
            setProfile(migrateProfile(updated));
            setEditingSections((prev) => {
                const next = new Set(prev);
                next.delete(section);
                return next;
            });
            setSectionSaveSuccess(section);
            setTimeout(() => setSectionSaveSuccess(null), 3000);
        } catch (err) {
            setError(err as Error);
        } finally {
            setSavingSection(null);
        }
    };

    // Update handlers
    const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
        if (field === 'email') {
            return;
        }

        setProfile((prev) => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value },
        }));

        if (
            (field === 'full_name' || field === 'phone_number' || field === 'location') &&
            fieldErrors[field]
        ) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const updateExperience = (index: number, field: keyof Experience, value: string | null) => {
        setProfile((prev) => ({
            ...prev,
            experience: prev.experience.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const addExperience = () => {
        setProfile((prev) => ({
            ...prev,
            experience: [...prev.experience, { ...emptyExperience }],
        }));
    };

    const removeExperience = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
        }));
        setExperienceFieldErrors({});
        setExperienceToDelete(null);
    };

    const updateEducation = (
        index: number,
        field: keyof Education,
        value: Education[keyof Education]
    ) => {
        setProfile((prev) => ({
            ...prev,
            education: prev.education.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    const addEducation = () => {
        setProfile((prev) => ({
            ...prev,
            education: [...prev.education, { ...emptyEducation }],
        }));
    };

    const removeEducation = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }));
        setEducationFieldErrors({});
        setEducationToDelete(null);
    };

    const updateCertification = (index: number, field: keyof Certification, value: string) => {
        setProfile((prev) => ({
            ...prev,
            certifications: (prev.certifications || []).map((cert, i) =>
                i === index ? { ...cert, [field]: value } : cert
            ),
        }));
    };

    const addCertification = () => {
        setProfile((prev) => ({
            ...prev,
            certifications: [...(prev.certifications || []), { ...emptyCertification }],
        }));
    };

    const removeCertification = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            certifications: (prev.certifications || []).filter((_, i) => i !== index),
        }));
    };

    // New Section Handlers
    const updateSection = <T extends keyof Profile>(
        section: T,
        index: number,
        field: string,
        value: unknown
    ) => {
        if (section === 'areas_of_interest' || section === 'hobbies') {
            setProfile((prev) => ({
                ...prev,
                [section]: value as string[],
            }));
            return;
        }

        setProfile((prev) => {
            const arr = [...((prev[section] as unknown[]) || [])];
            arr[index] = { ...(arr[index] as object), [field]: value };
            return { ...prev, [section]: arr };
        });
    };

    const addSectionItem = <T extends keyof Profile>(section: T, emptyItem: any) => {
        setProfile((prev) => ({
            ...prev,
            [section]: [...(prev[section] as any[] || []), { ...emptyItem, id: crypto.randomUUID() }],
        }));
    };

    const removeSectionItem = <T extends keyof Profile>(section: T, index: number) => {
        setProfile((prev) => ({
            ...prev,
            [section]: ((prev[section] as unknown[]) || []).filter((_, i) => i !== index),
        }));
        setSectionFieldErrors((prev) => {
            const next = { ...prev };
            delete next[section as ProfileSectionKey];
            return next;
        });
        setSectionDeleteTarget(null);
    };

    // Skills management
    const [skillInput, setSkillInput] = useState('');

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !profile.skills.includes(skill)) {
            setProfile((prev) => ({
                ...prev,
                skills: [...prev.skills, skill],
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        setProfile((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    if (isLoading) {
        return <Loading fullPage text="Loading profile..." />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Your Profile</h1>
                <p className="text-muted-foreground">
                    Build your professional profile. This information will be used to customize your resume.
                </p>
            </div>

            {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}

            <div className="space-y-12 pb-12">
                {/* Personal Info Section */}
                <ProfileSectionCard
                    id={SECTION_IDS.personalInfo}
                    title="Personal Info"
                    isEditing={isSectionEditing('personalInfo')}
                    isSaving={savingSection === 'personalInfo'}
                    saveSuccess={sectionSaveSuccess === 'personalInfo'}
                    onEdit={() => startSectionEdit('personalInfo')}
                    onSave={() => saveSection('personalInfo')}
                    onCancel={() => cancelSectionEdit('personalInfo')}
                >
                    <ProfileSectionFieldset isEditing={isSectionEditing('personalInfo')} className={styles.form}>
                        <Input
                            label="Full Name"
                            value={profile.personalInfo.full_name}
                            onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                            placeholder="John Doe"
                            required
                            error={fieldErrors.full_name}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={profile.personalInfo.email}
                            placeholder="john@example.com"
                            required
                            disabled
                            readOnly
                            helperText="Email is managed by your account and cannot be changed here."
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={profile.personalInfo.phone_number || ''}
                            onChange={(e) =>
                                updatePersonalInfo('phone_number', sanitizePhoneInput(e.target.value))
                            }
                            placeholder="+91-9876543210"
                            helperText="Use format +<countryCode>-<number> (e.g. +91-9876543210)."
                            required
                            error={fieldErrors.phone_number}
                        />
                        <LocationPicker
                            value={profile.personalInfo.location || ''}
                            onChange={(location) => updatePersonalInfo('location', location)}
                            required
                            error={fieldErrors.location}
                            disabled={!isSectionEditing('personalInfo')}
                        />
                        <Input
                            label="Portfolio URL"
                            type="url"
                            value={profile.personalInfo.portfolio_url || ''}
                            onChange={(e) => updatePersonalInfo('portfolio_url', e.target.value)}
                            placeholder="https://yourwebsite.com"
                        />
                    </ProfileSectionFieldset>
                </ProfileSectionCard>

                {/* Summary Section */}
                <ProfileSectionCard
                    id={SECTION_IDS.summary}
                    title="Professional Summary"
                    isEditing={isSectionEditing('summary')}
                    isSaving={savingSection === 'summary'}
                    saveSuccess={sectionSaveSuccess === 'summary'}
                    onEdit={() => startSectionEdit('summary')}
                    onSave={() => saveSection('summary')}
                    onCancel={() => cancelSectionEdit('summary')}
                >
                    <ProfileSectionFieldset isEditing={isSectionEditing('summary')} className={styles.form}>
                        <Textarea
                            label="Summary"
                            value={profile.summary}
                            onChange={(e) => {
                                setProfile((prev) => ({ ...prev, summary: e.target.value }));
                                if (summaryError) {
                                    setSummaryError(undefined);
                                }
                            }}
                            placeholder="Write a compelling summary..."
                            maxLength={2500}
                            charCount
                            rows={8}
                            required
                            error={summaryError}
                        />
                    </ProfileSectionFieldset>
                </ProfileSectionCard>

                {/* Experience Section */}
                <ProfileSectionCard
                    id={SECTION_IDS.experience}
                    title="Experience"
                    isEditing={isSectionEditing('experience')}
                    isSaving={savingSection === 'experience'}
                    saveSuccess={sectionSaveSuccess === 'experience'}
                    onEdit={() => startSectionEdit('experience')}
                    onSave={() => saveSection('experience')}
                    onCancel={() => cancelSectionEdit('experience')}
                >
                    <ProfileSectionFieldset isEditing={isSectionEditing('experience')} className={styles.form}>
                        {profile.experience.map((exp, index) => (
                            <div key={index} className={styles.entryCard}>
                                <div className={styles.entryHeader}>
                                    <span className={styles.entryTitle}>Experience {index + 1}</span>
                                    {isSectionEditing('experience') && (
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => setExperienceToDelete(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className={styles.entryFields}>
                                    <Input
                                        label="Company"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                        placeholder="Company Name"
                                        required
                                        error={experienceFieldErrors[index]?.company}
                                    />
                                    <Input
                                        label="Title"
                                        value={exp.title}
                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                        placeholder="Job Title"
                                        required
                                        error={experienceFieldErrors[index]?.title}
                                    />
                                    <div className={styles.dateRow}>
                                        <Input
                                            label="Start Date"
                                            type="month"
                                            value={dateToMonthValue(exp.start_date)}
                                            onChange={(e) =>
                                                updateExperience(
                                                    index,
                                                    'start_date',
                                                    monthValueToApiDate(e.target.value)
                                                )
                                            }
                                            helperText="Month and year only"
                                            required
                                            error={experienceFieldErrors[index]?.start_date}
                                        />
                                        <Input
                                            label="End Date"
                                            type="month"
                                            value={dateToMonthValue(exp.end_date || '')}
                                            onChange={(e) =>
                                                updateExperience(
                                                    index,
                                                    'end_date',
                                                    e.target.value
                                                        ? monthValueToApiDate(e.target.value)
                                                        : ''
                                                )
                                            }
                                            helperText="Month and year only"
                                            disabled={isCurrentlyWorking(exp)}
                                            required={!isCurrentlyWorking(exp)}
                                            error={experienceFieldErrors[index]?.end_date}
                                        />
                                    </div>
                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            checked={isCurrentlyWorking(exp)}
                                            onChange={(e) => {
                                                updateExperience(
                                                    index,
                                                    'end_date',
                                                    e.target.checked ? null : ''
                                                );
                                            }}
                                        />
                                        <span>I currently work here</span>
                                    </label>
                                    <Textarea
                                        label="Description"
                                        value={exp.description || ''}
                                        onChange={(e) =>
                                            updateExperience(index, 'description', e.target.value)
                                        }
                                        placeholder="Describe your responsibilities..."
                                        rows={4}
                                        required
                                        error={experienceFieldErrors[index]?.description}
                                    />
                                </div>
                            </div>
                        ))}
                    </ProfileSectionFieldset>
                    {isSectionEditing('experience') && (
                        <Button variant="secondary" onClick={addExperience}>
                            + Add Experience
                        </Button>
                    )}
                </ProfileSectionCard>

                {/* Education Section */}
                <ProfileSectionCard
                    id={SECTION_IDS.education}
                    title="Education"
                    isEditing={isSectionEditing('education')}
                    isSaving={savingSection === 'education'}
                    saveSuccess={sectionSaveSuccess === 'education'}
                    onEdit={() => startSectionEdit('education')}
                    onSave={() => saveSection('education')}
                    onCancel={() => cancelSectionEdit('education')}
                >
                    <ProfileSectionFieldset isEditing={isSectionEditing('education')} className={styles.form}>
                        {profile.education.map((edu, index) => (
                            <div key={index} className={styles.entryCard}>
                                <div className={styles.entryHeader}>
                                    <span className={styles.entryTitle}>Education {index + 1}</span>
                                    {isSectionEditing('education') && (
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => setEducationToDelete(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className={styles.entryFields}>
                                    <Input
                                        label="Institute Name"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                        placeholder="University or college name"
                                        required
                                        error={educationFieldErrors[index]?.institution}
                                    />
                                    <Select
                                        label="Degree Level"
                                        value={edu.degree_level || ''}
                                        onChange={(value) => updateEducation(index, 'degree_level', value)}
                                        options={DEGREE_LEVEL_OPTIONS.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        placeholder="Select degree level"
                                        required
                                        error={educationFieldErrors[index]?.degree_level}
                                    />
                                    {edu.degree_level === 'Other' && (
                                        <Input
                                            label="Degree Level (Other)"
                                            value={edu.degree_level_other || ''}
                                            onChange={(e) =>
                                                updateEducation(index, 'degree_level_other', e.target.value)
                                            }
                                            placeholder="Specify degree level"
                                            required
                                            error={educationFieldErrors[index]?.degree_level_other}
                                        />
                                    )}
                                    <Select
                                        label="Course"
                                        value={edu.course || ''}
                                        onChange={(value) => updateEducation(index, 'course', value)}
                                        options={COURSE_OPTIONS.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        placeholder="Select course"
                                        required
                                        error={educationFieldErrors[index]?.course}
                                    />
                                    {edu.course === 'Other' && (
                                        <Input
                                            label="Course (Other)"
                                            value={edu.course_other || ''}
                                            onChange={(e) => updateEducation(index, 'course_other', e.target.value)}
                                            placeholder="Specify course"
                                            required
                                            error={educationFieldErrors[index]?.course_other}
                                        />
                                    )}
                                    <Input
                                        label="Specialization"
                                        value={edu.specialization || ''}
                                        onChange={(e) => updateEducation(index, 'specialization', e.target.value)}
                                        placeholder="e.g. Computer Science"
                                        required
                                        error={educationFieldErrors[index]?.specialization}
                                    />
                                    <RegionPicker
                                        value={edu.location || ''}
                                        onChange={(location) => updateEducation(index, 'location', location)}
                                        required
                                        disabled={!isSectionEditing('education')}
                                        error={educationFieldErrors[index]?.location}
                                    />
                                    <fieldset className={styles.gradeFieldset}>
                                        <legend className={styles.gradeLegend}>Grade</legend>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.checkboxRow}>
                                                <input
                                                    type="radio"
                                                    name={`grade-type-${index}`}
                                                    checked={edu.grade_type === 'percentage'}
                                                    onChange={() =>
                                                        updateEducation(index, 'grade_type', 'percentage')
                                                    }
                                                />
                                                <span>Percentage</span>
                                            </label>
                                            <label className={styles.checkboxRow}>
                                                <input
                                                    type="radio"
                                                    name={`grade-type-${index}`}
                                                    checked={edu.grade_type === 'cgpa'}
                                                    onChange={() => updateEducation(index, 'grade_type', 'cgpa')}
                                                />
                                                <span>CGPA</span>
                                            </label>
                                        </div>
                                        {edu.grade_type && (
                                            <Input
                                                label={
                                                    edu.grade_type === 'percentage'
                                                        ? 'Percentage (0–100)'
                                                        : 'CGPA (0–10)'
                                                }
                                                type="number"
                                                step={edu.grade_type === 'percentage' ? '0.1' : '0.1'}
                                                min={0}
                                                max={edu.grade_type === 'percentage' ? 100 : 10}
                                                value={
                                                    edu.grade_value === undefined || edu.grade_value === null
                                                        ? ''
                                                        : String(edu.grade_value)
                                                }
                                                onChange={(e) => {
                                                    const nextValue = e.target.value;
                                                    updateEducation(
                                                        index,
                                                        'grade_value',
                                                        nextValue === '' ? undefined : Number(nextValue)
                                                    );
                                                }}
                                                required
                                                error={educationFieldErrors[index]?.grade_value}
                                            />
                                        )}
                                    </fieldset>
                                    <div className={styles.dateRow}>
                                        <Input
                                            label="Start Date"
                                            type="month"
                                            value={dateToMonthValue(edu.start_date)}
                                            onChange={(e) =>
                                                updateEducation(
                                                    index,
                                                    'start_date',
                                                    monthValueToApiDate(e.target.value)
                                                )
                                            }
                                            helperText="Month and year only"
                                            required
                                            error={educationFieldErrors[index]?.start_date}
                                        />
                                        <Input
                                            label="End Date"
                                            type="month"
                                            value={dateToMonthValue(edu.end_date || '')}
                                            onChange={(e) =>
                                                updateEducation(
                                                    index,
                                                    'end_date',
                                                    e.target.value
                                                        ? monthValueToApiDate(e.target.value)
                                                        : ''
                                                )
                                            }
                                            helperText="Month and year only"
                                            disabled={isCurrentlyStudying(edu)}
                                            required={!isCurrentlyStudying(edu)}
                                            error={educationFieldErrors[index]?.end_date}
                                        />
                                    </div>
                                    <label className={styles.checkboxRow}>
                                        <input
                                            type="checkbox"
                                            checked={isCurrentlyStudying(edu)}
                                            onChange={(e) => {
                                                updateEducation(
                                                    index,
                                                    'end_date',
                                                    e.target.checked ? null : ''
                                                );
                                            }}
                                        />
                                        <span>I currently study here</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </ProfileSectionFieldset>
                    {isSectionEditing('education') && (
                        <Button variant="secondary" onClick={addEducation}>
                            + Add Education
                        </Button>
                    )}
                </ProfileSectionCard>

                {/* Skills Section */}
                <ProfileSectionCard
                    id={SECTION_IDS.skills}
                    title="Skills"
                    isEditing={isSectionEditing('skills')}
                    isSaving={savingSection === 'skills'}
                    saveSuccess={sectionSaveSuccess === 'skills'}
                    onEdit={() => startSectionEdit('skills')}
                    onSave={() => saveSection('skills')}
                    onCancel={() => cancelSectionEdit('skills')}
                >
                    <ProfileSectionFieldset isEditing={isSectionEditing('skills')} className={styles.form}>
                        {isSectionEditing('skills') && (
                            <div className={styles.skillInput}>
                                <Input
                                    label="Add Skill"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    placeholder="e.g., Python, React"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSkill();
                                        }
                                    }}
                                />
                                <Button variant="secondary" onClick={addSkill}>
                                    Add
                                </Button>
                            </div>
                        )}
                        <div className={styles.skillsList}>
                            {profile.skills.map((skill, index) => (
                                <span key={index} className={styles.skillTag}>
                                    {skill}
                                    {isSectionEditing('skills') && (
                                        <button
                                            type="button"
                                            className={styles.skillRemove}
                                            onClick={() => removeSkill(index)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </ProfileSectionFieldset>
                </ProfileSectionCard>

                <ExtendedProfileSections
                    profile={profile}
                    isSectionEditing={(section) => isSectionEditing(section)}
                    savingSection={
                        savingSection as ExtendedProfileSectionKey | null
                    }
                    sectionSaveSuccess={
                        sectionSaveSuccess as ExtendedProfileSectionKey | null
                    }
                    startSectionEdit={(section) => startSectionEdit(section)}
                    saveSection={(section) => saveSection(section)}
                    cancelSectionEdit={(section) => cancelSectionEdit(section)}
                    updateSection={updateSection}
                    addSectionItem={addSectionItem}
                    requestRemove={(section, index) => setSectionDeleteTarget({ section, index })}
                    sectionFieldErrors={sectionFieldErrors}
                    SECTION_IDS={SECTION_IDS}
                />

            </div>

            <ConfirmDialog
                open={sectionDeleteTarget !== null}
                title="Remove entry?"
                message="Remove this entry? This cannot be undone until you cancel editing."
                confirmLabel="Remove"
                onConfirm={() => {
                    if (sectionDeleteTarget) {
                        removeSectionItem(sectionDeleteTarget.section, sectionDeleteTarget.index);
                    }
                }}
                onCancel={() => setSectionDeleteTarget(null)}
            />
            <ConfirmDialog
                open={experienceToDelete !== null}
                title="Remove experience?"
                message="Remove this experience entry? This cannot be undone until you cancel editing."
                confirmLabel="Remove"
                onConfirm={() => {
                    if (experienceToDelete !== null) {
                        removeExperience(experienceToDelete);
                    }
                }}
                onCancel={() => setExperienceToDelete(null)}
            />
            <ConfirmDialog
                open={educationToDelete !== null}
                title="Remove education?"
                message="Remove this education entry? This cannot be undone until you cancel editing."
                confirmLabel="Remove"
                onConfirm={() => {
                    if (educationToDelete !== null) {
                        removeEducation(educationToDelete);
                    }
                }}
                onCancel={() => setEducationToDelete(null)}
            />
        </div>
    );
}
