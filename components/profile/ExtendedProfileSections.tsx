'use client';

import {
    Achievement,
    CareerBreak,
    Language,
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
import { Button, Input, Textarea, Select } from '@/components/ui';
import { ProfileSectionCard, ProfileSectionFieldset } from '@/components/profile/ProfileSectionCard';
import { TagInput } from '@/components/profile/TagInput';
import { MonthDurationRow, isOngoingEntry } from '@/components/profile/MonthDurationRow';
import { AdvancedFieldGroup } from '@/components/profile/AdvancedFieldGroup';
import { LanguageSelect } from '@/components/profile/LanguageSelect';
import { ProficiencySelect } from '@/components/profile/ProficiencySelect';
import { dateToMonthValue, monthValueToApiDate } from '@/lib/validation/dates';
import { CAREER_BREAK_REASONS } from '@/lib/validation/profileSections';
import styles from '@/app/(dashboard)/profile/page.module.css';

export type ProfileSectionKey =
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

interface ExtendedProfileSectionsProps {
    profile: Profile;
    isSectionEditing: (section: ProfileSectionKey) => boolean;
    savingSection: ProfileSectionKey | null;
    sectionSaveSuccess: ProfileSectionKey | null;
    startSectionEdit: (section: ProfileSectionKey) => void;
    saveSection: (section: ProfileSectionKey) => void;
    cancelSectionEdit: (section: ProfileSectionKey) => void;
    updateSection: <T extends keyof Profile>(
        section: T,
        index: number,
        field: string,
        value: unknown
    ) => void;
    addSectionItem: <T extends keyof Profile>(section: T, emptyItem: unknown) => void;
    requestRemove: (section: ProfileSectionKey, index: number) => void;
    sectionFieldErrors: Partial<Record<ProfileSectionKey, Record<number, Record<string, string>>>>;
    SECTION_IDS: Record<string, string>;
}

function newId(): string {
    return typeof crypto !== 'undefined'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(7);
}

const emptyProject: Project = {
    id: newId(),
    title: '',
    role: '',
    description: '',
    start_date: '',
    end_date: '',
    ongoing: false,
    technologies: [],
};

const emptyAchievement: Achievement = {
    id: newId(),
    title: '',
    description: '',
};

const emptyPublication: Publication = {
    id: newId(),
    title: '',
    authors: [{ name: '' }],
    keywords: [],
    subject_categories: [],
    funding_sources: [],
    grant_numbers: [],
};

const emptyPatent: Patent = {
    id: newId(),
    title: '',
    patent_number: '',
    status: 'pending',
    abstract: '',
    keywords: [],
    inventors: [],
    applicants: [],
    assignees: [],
    ipc_codes: [],
    cpc_codes: [],
    us_classifications: [],
    publication_languages: [],
};

const emptyLicense: License = {
    id: newId(),
    name: '',
    issuer: '',
};

const emptyTraining: Training = {
    id: newId(),
    title: '',
    provider: '',
    description: '',
};

const emptyVolunteering: Volunteering = {
    id: newId(),
    organization: '',
    role: '',
    description: '',
};

const emptyOrganization: Organization = {
    id: newId(),
    name: '',
    role: '',
    description: '',
};

const emptyPosition: Position = {
    id: newId(),
    title: '',
    organization: '',
    description: '',
};

const emptyCareerBreak: CareerBreak = {
    id: newId(),
    start_date: '',
    reason: '',
    description: '',
};

const emptyLanguage: Language = {
    language: '',
    read_proficiency: '',
    write_proficiency: '',
    speak_proficiency: '',
};

const emptyTestScore: TestScore = {
    id: newId(),
    test_name: '',
    score: '',
};

const PATENT_STATUS_OPTIONS = [
    { value: 'filed', label: 'Filed' },
    { value: 'granted', label: 'Granted' },
    { value: 'pending', label: 'Pending' },
];

const PUBLICATION_TYPE_OPTIONS = [
    { value: 'journal_article', label: 'Journal Article' },
    { value: 'review', label: 'Review' },
    { value: 'preprint', label: 'Preprint' },
];

const DOCUMENT_TYPE_OPTIONS = [
    { value: 'article', label: 'Article' },
    { value: 'review', label: 'Review' },
    { value: 'letter', label: 'Letter' },
];

export function ExtendedProfileSections({
    profile,
    isSectionEditing,
    savingSection,
    sectionSaveSuccess,
    startSectionEdit,
    saveSection,
    cancelSectionEdit,
    updateSection,
    addSectionItem,
    requestRemove,
    sectionFieldErrors,
    SECTION_IDS,
}: ExtendedProfileSectionsProps) {
    const fieldError = (section: ProfileSectionKey, index: number, field: string) =>
        sectionFieldErrors[section]?.[index]?.[field];

    const updateTagArray = (section: 'areas_of_interest' | 'hobbies', values: string[]) => {
        updateSection(section, 0, '', values);
    };

    const updatePublicationAuthor = (
        pubIndex: number,
        authorIndex: number,
        field: keyof PublicationAuthor,
        value: string
    ) => {
        const pub = (profile.publications || [])[pubIndex];
        const authors = [...(pub?.authors || [])];
        authors[authorIndex] = { ...authors[authorIndex], [field]: value };
        updateSection('publications', pubIndex, 'authors', authors);
    };

    const addPublicationAuthor = (pubIndex: number) => {
        const pub = (profile.publications || [])[pubIndex];
        const authors = [...(pub?.authors || []), { name: '' }];
        updateSection('publications', pubIndex, 'authors', authors);
    };

    const removePublicationAuthor = (pubIndex: number, authorIndex: number) => {
        const pub = (profile.publications || [])[pubIndex];
        const authors = (pub?.authors || []).filter((_, i) => i !== authorIndex);
        updateSection('publications', pubIndex, 'authors', authors);
    };

    const renderEntryHeader = (
        section: ProfileSectionKey,
        index: number,
        label: string
    ) => (
        <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>
                {label} {index + 1}
            </span>
            {isSectionEditing(section) && (
                <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => requestRemove(section, index)}
                >
                    Remove
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Projects */}
            <ProfileSectionCard
                id={SECTION_IDS.projects}
                title="Projects"
                isEditing={isSectionEditing('projects')}
                isSaving={savingSection === 'projects'}
                saveSuccess={sectionSaveSuccess === 'projects'}
                onEdit={() => startSectionEdit('projects')}
                onSave={() => saveSection('projects')}
                onCancel={() => cancelSectionEdit('projects')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('projects')}
                    className={styles.form}
                >
                    {(profile.projects || []).map((project, index) => (
                        <div key={project.id || index} className={styles.entryCard}>
                            {renderEntryHeader('projects', index, 'Project')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={project.title}
                                    onChange={(e) =>
                                        updateSection('projects', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('projects', index, 'title')}
                                />
                                <Input
                                    label="Role"
                                    value={project.role}
                                    onChange={(e) =>
                                        updateSection('projects', index, 'role', e.target.value)
                                    }
                                    required
                                    error={fieldError('projects', index, 'role')}
                                />
                                <Textarea
                                    label="Description"
                                    value={project.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'projects',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('projects', index, 'description')}
                                />
                                <MonthDurationRow
                                    startDate={project.start_date || ''}
                                    endDate={project.end_date}
                                    ongoing={project.ongoing}
                                    onStartChange={(value) =>
                                        updateSection('projects', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('projects', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) => {
                                        updateSection('projects', index, 'ongoing', ongoing);
                                        updateSection(
                                            'projects',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        );
                                    }}
                                    ongoingLabel="This project is ongoing"
                                    startError={fieldError('projects', index, 'start_date')}
                                    endError={fieldError('projects', index, 'end_date')}
                                    disabled={!isSectionEditing('projects')}
                                />
                                <TagInput
                                    label="Technologies"
                                    values={project.technologies || []}
                                    onChange={(values) =>
                                        updateSection('projects', index, 'technologies', values)
                                    }
                                    placeholder="e.g., React, Python"
                                    disabled={!isSectionEditing('projects')}
                                />
                                <Input
                                    label="GitHub URL"
                                    type="url"
                                    value={project.github_url || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'projects',
                                            index,
                                            'github_url',
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://github.com/..."
                                />
                                <Input
                                    label="Deployment URL"
                                    type="url"
                                    value={project.deployment_url || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'projects',
                                            index,
                                            'deployment_url',
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('projects') && (
                    <Button variant="secondary" onClick={() => addSectionItem('projects', emptyProject)}>
                        + Add Project
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Achievements */}
            <ProfileSectionCard
                id={SECTION_IDS.achievements}
                title="Achievements"
                isEditing={isSectionEditing('achievements')}
                isSaving={savingSection === 'achievements'}
                saveSuccess={sectionSaveSuccess === 'achievements'}
                onEdit={() => startSectionEdit('achievements')}
                onSave={() => saveSection('achievements')}
                onCancel={() => cancelSectionEdit('achievements')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('achievements')}
                    className={styles.form}
                >
                    {(profile.achievements || []).map((achievement, index) => (
                        <div key={achievement.id || index} className={styles.entryCard}>
                            {renderEntryHeader('achievements', index, 'Achievement')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={achievement.title}
                                    onChange={(e) =>
                                        updateSection('achievements', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('achievements', index, 'title')}
                                />
                                <Textarea
                                    label="Description"
                                    value={achievement.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'achievements',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('achievements', index, 'description')}
                                />
                                <Input
                                    label="Date"
                                    type="month"
                                    value={dateToMonthValue(achievement.date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'achievements',
                                            index,
                                            'date',
                                            monthValueToApiDate(e.target.value)
                                        )
                                    }
                                    helperText="Month and year only"
                                    required
                                    error={fieldError('achievements', index, 'date')}
                                />
                                <Input
                                    label="Location"
                                    value={achievement.location || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'achievements',
                                            index,
                                            'location',
                                            e.target.value
                                        )
                                    }
                                />
                                <label className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={achievement.is_virtual || false}
                                        onChange={(e) =>
                                            updateSection(
                                                'achievements',
                                                index,
                                                'is_virtual',
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>Virtual event</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('achievements') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('achievements', emptyAchievement)}
                    >
                        + Add Achievement
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Publications */}
            <ProfileSectionCard
                id={SECTION_IDS.publications}
                title="Publications"
                isEditing={isSectionEditing('publications')}
                isSaving={savingSection === 'publications'}
                saveSuccess={sectionSaveSuccess === 'publications'}
                onEdit={() => startSectionEdit('publications')}
                onSave={() => saveSection('publications')}
                onCancel={() => cancelSectionEdit('publications')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('publications')}
                    className={styles.form}
                >
                    {(profile.publications || []).map((pub, index) => (
                        <div key={pub.id || index} className={styles.entryCard}>
                            {renderEntryHeader('publications', index, 'Publication')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={pub.title}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('publications', index, 'title')}
                                />
                                <Input
                                    label="Subtitle"
                                    value={pub.subtitle || ''}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'subtitle', e.target.value)
                                    }
                                />
                                <Input
                                    label="Venue"
                                    value={pub.venue || ''}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'venue', e.target.value)
                                    }
                                    required
                                    error={fieldError('publications', index, 'venue')}
                                />
                                <Input
                                    label="Publication Date"
                                    type="month"
                                    value={dateToMonthValue(pub.date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'publications',
                                            index,
                                            'date',
                                            monthValueToApiDate(e.target.value)
                                        )
                                    }
                                    helperText="Month and year only"
                                    required
                                    error={fieldError('publications', index, 'date')}
                                />
                                <Input
                                    label="DOI"
                                    value={pub.doi || ''}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'doi', e.target.value)
                                    }
                                    error={fieldError('publications', index, 'doi')}
                                />
                                <Input
                                    label="URL"
                                    type="url"
                                    value={pub.url || ''}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'url', e.target.value)
                                    }
                                />
                                <Textarea
                                    label="Abstract"
                                    value={pub.abstract || ''}
                                    onChange={(e) =>
                                        updateSection('publications', index, 'abstract', e.target.value)
                                    }
                                    rows={4}
                                />

                                <fieldset className={styles.gradeFieldset}>
                                    <legend className={styles.gradeLegend}>Authors</legend>
                                    {(pub.authors || []).map((author, authorIndex) => (
                                        <div key={authorIndex} className={styles.entryFields}>
                                            <Input
                                                label={`Author ${authorIndex + 1} Name`}
                                                value={author.name}
                                                onChange={(e) =>
                                                    updatePublicationAuthor(
                                                        index,
                                                        authorIndex,
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                required={authorIndex === 0}
                                            />
                                            <Input
                                                label="Affiliation"
                                                value={author.affiliation || ''}
                                                onChange={(e) =>
                                                    updatePublicationAuthor(
                                                        index,
                                                        authorIndex,
                                                        'affiliation',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {isSectionEditing('publications') &&
                                                (pub.authors || []).length > 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.removeButton}
                                                        onClick={() =>
                                                            removePublicationAuthor(
                                                                index,
                                                                authorIndex
                                                            )
                                                        }
                                                    >
                                                        Remove Author
                                                    </button>
                                                )}
                                        </div>
                                    ))}
                                    {fieldError('publications', index, 'authors') && (
                                        <span className={styles.inlineError}>
                                            {fieldError('publications', index, 'authors')}
                                        </span>
                                    )}
                                    {isSectionEditing('publications') && (
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => addPublicationAuthor(index)}
                                        >
                                            + Add Author
                                        </Button>
                                    )}
                                </fieldset>

                                <AdvancedFieldGroup title="Advanced publication details">
                                    <Input
                                        label="PMID"
                                        value={pub.pmid || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'pmid', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="PMCID"
                                        value={pub.pmcid || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'pmcid', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="ISBN"
                                        value={pub.isbn || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'isbn', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="ISSN"
                                        value={pub.issn || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'issn', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="arXiv ID"
                                        value={pub.arxiv_id || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'arxiv_id',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Editor"
                                        value={pub.editor || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'editor', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="Volume"
                                        value={pub.volume || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'volume', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="Issue"
                                        value={pub.issue || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'issue', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="Page Range"
                                        value={pub.page_range || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'page_range',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Article Number"
                                        value={pub.article_number || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'article_number',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Online Date"
                                        type="month"
                                        value={dateToMonthValue(pub.online_date || '')}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'online_date',
                                                e.target.value
                                                    ? monthValueToApiDate(e.target.value)
                                                    : ''
                                            )
                                        }
                                        helperText="Month and year only"
                                    />
                                    <Input
                                        label="Accepted Date"
                                        type="month"
                                        value={dateToMonthValue(pub.accepted_date || '')}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'accepted_date',
                                                e.target.value
                                                    ? monthValueToApiDate(e.target.value)
                                                    : ''
                                            )
                                        }
                                        helperText="Month and year only"
                                    />
                                    <Input
                                        label="Publication Year"
                                        type="number"
                                        value={
                                            pub.publication_year === undefined ||
                                            pub.publication_year === null
                                                ? ''
                                                : String(pub.publication_year)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'publication_year',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <Input
                                        label="Publication Month"
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={
                                            pub.publication_month === undefined ||
                                            pub.publication_month === null
                                                ? ''
                                                : String(pub.publication_month)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'publication_month',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <TagInput
                                        label="Keywords"
                                        values={pub.keywords || []}
                                        onChange={(values) =>
                                            updateSection('publications', index, 'keywords', values)
                                        }
                                        disabled={!isSectionEditing('publications')}
                                    />
                                    <TagInput
                                        label="Subject Categories"
                                        values={pub.subject_categories || []}
                                        onChange={(values) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'subject_categories',
                                                values
                                            )
                                        }
                                        disabled={!isSectionEditing('publications')}
                                    />
                                    <Input
                                        label="Landing Page URL"
                                        type="url"
                                        value={pub.landing_page_url || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'landing_page_url',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="PDF URL"
                                        type="url"
                                        value={pub.pdf_url || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'pdf_url',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Repository URL"
                                        type="url"
                                        value={pub.repository_url || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'repository_url',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Version Label"
                                        value={pub.version_label || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'version_label',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Version Date"
                                        type="month"
                                        value={dateToMonthValue(pub.version_date || '')}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'version_date',
                                                e.target.value
                                                    ? monthValueToApiDate(e.target.value)
                                                    : ''
                                            )
                                        }
                                        helperText="Month and year only"
                                    />
                                    <TagInput
                                        label="Funding Sources"
                                        values={pub.funding_sources || []}
                                        onChange={(values) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'funding_sources',
                                                values
                                            )
                                        }
                                        disabled={!isSectionEditing('publications')}
                                    />
                                    <TagInput
                                        label="Grant Numbers"
                                        values={pub.grant_numbers || []}
                                        onChange={(values) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'grant_numbers',
                                                values
                                            )
                                        }
                                        disabled={!isSectionEditing('publications')}
                                    />
                                    <Input
                                        label="Trial Registry"
                                        value={pub.trial_registry || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'trial_registry',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Ethics Approvals"
                                        value={pub.ethics_approvals || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'ethics_approvals',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Copyright Holder"
                                        value={pub.copyright_holder || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'copyright_holder',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="License"
                                        value={pub.license || ''}
                                        onChange={(e) =>
                                            updateSection('publications', index, 'license', e.target.value)
                                        }
                                    />
                                    <Input
                                        label="Reuse Permissions"
                                        value={pub.reuse_permissions || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'reuse_permissions',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Citation Count"
                                        type="number"
                                        min={0}
                                        value={
                                            pub.citation_count === undefined ||
                                            pub.citation_count === null
                                                ? ''
                                                : String(pub.citation_count)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'citation_count',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <Input
                                        label="Altmetric Score"
                                        type="number"
                                        min={0}
                                        value={
                                            pub.altmetric_score === undefined ||
                                            pub.altmetric_score === null
                                                ? ''
                                                : String(pub.altmetric_score)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'altmetric_score',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <Input
                                        label="Language"
                                        value={pub.language || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'language',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Select
                                        label="Publication Type"
                                        value={pub.publication_type || ''}
                                        onChange={(value) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'publication_type',
                                                value
                                            )
                                        }
                                        options={PUBLICATION_TYPE_OPTIONS}
                                        placeholder="Select type"
                                    />
                                    <Select
                                        label="Document Type"
                                        value={pub.document_type || ''}
                                        onChange={(value) =>
                                            updateSection(
                                                'publications',
                                                index,
                                                'document_type',
                                                value
                                            )
                                        }
                                        options={DOCUMENT_TYPE_OPTIONS}
                                        placeholder="Select document type"
                                    />
                                </AdvancedFieldGroup>
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('publications') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('publications', emptyPublication)}
                    >
                        + Add Publication
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Patents */}
            <ProfileSectionCard
                id={SECTION_IDS.patents}
                title="Patents"
                isEditing={isSectionEditing('patents')}
                isSaving={savingSection === 'patents'}
                saveSuccess={sectionSaveSuccess === 'patents'}
                onEdit={() => startSectionEdit('patents')}
                onSave={() => saveSection('patents')}
                onCancel={() => cancelSectionEdit('patents')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('patents')}
                    className={styles.form}
                >
                    {(profile.patents || []).map((patent, index) => (
                        <div key={patent.id || index} className={styles.entryCard}>
                            {renderEntryHeader('patents', index, 'Patent')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={patent.title}
                                    onChange={(e) =>
                                        updateSection('patents', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('patents', index, 'title')}
                                />
                                <Input
                                    label="Patent Number"
                                    value={patent.patent_number}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'patent_number',
                                            e.target.value
                                        )
                                    }
                                    required
                                    error={fieldError('patents', index, 'patent_number')}
                                />
                                <Select
                                    label="Status"
                                    value={patent.status}
                                    onChange={(value) =>
                                        updateSection('patents', index, 'status', value)
                                    }
                                    options={PATENT_STATUS_OPTIONS}
                                    required
                                />
                                <Textarea
                                    label="Abstract"
                                    value={patent.abstract || ''}
                                    onChange={(e) =>
                                        updateSection('patents', index, 'abstract', e.target.value)
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('patents', index, 'abstract')}
                                />
                                <TagInput
                                    label="Keywords"
                                    values={patent.keywords || []}
                                    onChange={(values) =>
                                        updateSection('patents', index, 'keywords', values)
                                    }
                                    disabled={!isSectionEditing('patents')}
                                />
                                <Input
                                    label="Application Number"
                                    value={patent.application_number || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'application_number',
                                            e.target.value
                                        )
                                    }
                                />
                                <Input
                                    label="Publication Number"
                                    value={patent.publication_number || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'publication_number',
                                            e.target.value
                                        )
                                    }
                                />
                                <TagInput
                                    label="Inventors"
                                    values={patent.inventors || []}
                                    onChange={(values) =>
                                        updateSection('patents', index, 'inventors', values)
                                    }
                                    disabled={!isSectionEditing('patents')}
                                    required
                                    error={fieldError('patents', index, 'inventors')}
                                />
                                <TagInput
                                    label="Applicants"
                                    values={patent.applicants || []}
                                    onChange={(values) =>
                                        updateSection('patents', index, 'applicants', values)
                                    }
                                    disabled={!isSectionEditing('patents')}
                                />
                                <TagInput
                                    label="Assignees"
                                    values={patent.assignees || []}
                                    onChange={(values) =>
                                        updateSection('patents', index, 'assignees', values)
                                    }
                                    disabled={!isSectionEditing('patents')}
                                />
                                <Input
                                    label="Priority Date"
                                    type="month"
                                    value={dateToMonthValue(patent.priority_date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'priority_date',
                                            e.target.value
                                                ? monthValueToApiDate(e.target.value)
                                                : ''
                                        )
                                    }
                                    helperText="Month and year only"
                                />
                                <Input
                                    label="Filing Date"
                                    type="month"
                                    value={dateToMonthValue(patent.filing_date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'filing_date',
                                            e.target.value
                                                ? monthValueToApiDate(e.target.value)
                                                : ''
                                        )
                                    }
                                    helperText="Month and year only"
                                />
                                <Input
                                    label="Publication Date"
                                    type="month"
                                    value={dateToMonthValue(patent.publication_date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'publication_date',
                                            e.target.value
                                                ? monthValueToApiDate(e.target.value)
                                                : ''
                                        )
                                    }
                                    helperText="Month and year only"
                                />
                                <Input
                                    label="Grant Date"
                                    type="month"
                                    value={dateToMonthValue(patent.grant_date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'grant_date',
                                            e.target.value
                                                ? monthValueToApiDate(e.target.value)
                                                : ''
                                        )
                                    }
                                    helperText="Month and year only"
                                />
                                <Input
                                    label="Patent Office"
                                    value={patent.patent_office || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'patents',
                                            index,
                                            'patent_office',
                                            e.target.value
                                        )
                                    }
                                />
                                <Input
                                    label="URL"
                                    type="url"
                                    value={patent.url || ''}
                                    onChange={(e) =>
                                        updateSection('patents', index, 'url', e.target.value)
                                    }
                                />

                                <AdvancedFieldGroup title="Advanced patent details">
                                    <Input
                                        label="Family ID"
                                        value={patent.family_id || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'family_id',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <TagInput
                                        label="IPC Codes"
                                        values={patent.ipc_codes || []}
                                        onChange={(values) =>
                                            updateSection('patents', index, 'ipc_codes', values)
                                        }
                                        disabled={!isSectionEditing('patents')}
                                    />
                                    <TagInput
                                        label="CPC Codes"
                                        values={patent.cpc_codes || []}
                                        onChange={(values) =>
                                            updateSection('patents', index, 'cpc_codes', values)
                                        }
                                        disabled={!isSectionEditing('patents')}
                                    />
                                    <TagInput
                                        label="US Classifications"
                                        values={patent.us_classifications || []}
                                        onChange={(values) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'us_classifications',
                                                values
                                            )
                                        }
                                        disabled={!isSectionEditing('patents')}
                                    />
                                    <Input
                                        label="Kind Code"
                                        value={patent.kind_code || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'kind_code',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Legal Status"
                                        value={patent.legal_status || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'legal_status',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="PCT Number"
                                        value={patent.pct_number || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'pct_number',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Representative"
                                        value={patent.representative || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'representative',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Drawings URL"
                                        type="url"
                                        value={patent.drawings_url || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'drawings_url',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="PDF URL"
                                        type="url"
                                        value={patent.pdf_url || ''}
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'pdf_url',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Input
                                        label="Forward Citations"
                                        type="number"
                                        min={0}
                                        value={
                                            patent.forward_citations === undefined ||
                                            patent.forward_citations === null
                                                ? ''
                                                : String(patent.forward_citations)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'forward_citations',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <Input
                                        label="Family Size"
                                        type="number"
                                        min={0}
                                        value={
                                            patent.family_size === undefined ||
                                            patent.family_size === null
                                                ? ''
                                                : String(patent.family_size)
                                        }
                                        onChange={(e) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'family_size',
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                    <TagInput
                                        label="Publication Languages"
                                        values={patent.publication_languages || []}
                                        onChange={(values) =>
                                            updateSection(
                                                'patents',
                                                index,
                                                'publication_languages',
                                                values
                                            )
                                        }
                                        disabled={!isSectionEditing('patents')}
                                    />
                                </AdvancedFieldGroup>
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('patents') && (
                    <Button variant="secondary" onClick={() => addSectionItem('patents', emptyPatent)}>
                        + Add Patent
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Licenses */}
            <ProfileSectionCard
                id={SECTION_IDS.licenses}
                title="Licenses"
                isEditing={isSectionEditing('licenses')}
                isSaving={savingSection === 'licenses'}
                saveSuccess={sectionSaveSuccess === 'licenses'}
                onEdit={() => startSectionEdit('licenses')}
                onSave={() => saveSection('licenses')}
                onCancel={() => cancelSectionEdit('licenses')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('licenses')}
                    className={styles.form}
                >
                    {(profile.licenses || []).map((lic, index) => (
                        <div key={lic.id || index} className={styles.entryCard}>
                            {renderEntryHeader('licenses', index, 'License')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Name"
                                    value={lic.name}
                                    onChange={(e) =>
                                        updateSection('licenses', index, 'name', e.target.value)
                                    }
                                    required
                                    error={fieldError('licenses', index, 'name')}
                                />
                                <Input
                                    label="Issuer"
                                    value={lic.issuer}
                                    onChange={(e) =>
                                        updateSection('licenses', index, 'issuer', e.target.value)
                                    }
                                    required
                                    error={fieldError('licenses', index, 'issuer')}
                                />
                                <Input
                                    label="License Number"
                                    value={lic.license_number || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'licenses',
                                            index,
                                            'license_number',
                                            e.target.value
                                        )
                                    }
                                />
                                <Input
                                    label="Awarded Date"
                                    type="month"
                                    value={dateToMonthValue(lic.awarded_date || lic.date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'licenses',
                                            index,
                                            'awarded_date',
                                            monthValueToApiDate(e.target.value)
                                        )
                                    }
                                    helperText="Month and year only"
                                    required
                                    error={fieldError('licenses', index, 'awarded_date')}
                                />
                                <Input
                                    label="Expiration Date"
                                    type="month"
                                    value={dateToMonthValue(lic.expiration_date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'licenses',
                                            index,
                                            'expiration_date',
                                            e.target.value
                                                ? monthValueToApiDate(e.target.value)
                                                : ''
                                        )
                                    }
                                    helperText="Month and year only"
                                />
                                <Input
                                    label="URL"
                                    type="url"
                                    value={lic.url || ''}
                                    onChange={(e) =>
                                        updateSection('licenses', index, 'url', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('licenses') && (
                    <Button variant="secondary" onClick={() => addSectionItem('licenses', emptyLicense)}>
                        + Add License
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Trainings */}
            <ProfileSectionCard
                id={SECTION_IDS.trainings}
                title="Trainings"
                isEditing={isSectionEditing('trainings')}
                isSaving={savingSection === 'trainings'}
                saveSuccess={sectionSaveSuccess === 'trainings'}
                onEdit={() => startSectionEdit('trainings')}
                onSave={() => saveSection('trainings')}
                onCancel={() => cancelSectionEdit('trainings')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('trainings')}
                    className={styles.form}
                >
                    {(profile.trainings || []).map((training, index) => (
                        <div key={training.id || index} className={styles.entryCard}>
                            {renderEntryHeader('trainings', index, 'Training')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={training.title}
                                    onChange={(e) =>
                                        updateSection('trainings', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('trainings', index, 'title')}
                                />
                                <Input
                                    label="Provider"
                                    value={training.provider}
                                    onChange={(e) =>
                                        updateSection('trainings', index, 'provider', e.target.value)
                                    }
                                    required
                                    error={fieldError('trainings', index, 'provider')}
                                />
                                <MonthDurationRow
                                    startDate={training.start_date || ''}
                                    endDate={training.end_date}
                                    ongoing={isOngoingEntry(training.end_date)}
                                    onStartChange={(value) =>
                                        updateSection('trainings', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('trainings', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) =>
                                        updateSection(
                                            'trainings',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        )
                                    }
                                    ongoingLabel="Training is ongoing"
                                    startError={fieldError('trainings', index, 'start_date')}
                                    endError={fieldError('trainings', index, 'end_date')}
                                    disabled={!isSectionEditing('trainings')}
                                />
                                <Input
                                    label="Venue"
                                    value={training.venue || ''}
                                    onChange={(e) =>
                                        updateSection('trainings', index, 'venue', e.target.value)
                                    }
                                />
                                <label className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={training.is_virtual || false}
                                        onChange={(e) =>
                                            updateSection(
                                                'trainings',
                                                index,
                                                'is_virtual',
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>Virtual venue</span>
                                </label>
                                <Textarea
                                    label="Description"
                                    value={training.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'trainings',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('trainings', index, 'description')}
                                />
                                <Input
                                    label="Certificate URL"
                                    type="url"
                                    value={training.certificate_url || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'trainings',
                                            index,
                                            'certificate_url',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('trainings') && (
                    <Button variant="secondary" onClick={() => addSectionItem('trainings', emptyTraining)}>
                        + Add Training
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Volunteering */}
            <ProfileSectionCard
                id={SECTION_IDS.volunteering}
                title="Volunteering"
                isEditing={isSectionEditing('volunteering')}
                isSaving={savingSection === 'volunteering'}
                saveSuccess={sectionSaveSuccess === 'volunteering'}
                onEdit={() => startSectionEdit('volunteering')}
                onSave={() => saveSection('volunteering')}
                onCancel={() => cancelSectionEdit('volunteering')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('volunteering')}
                    className={styles.form}
                >
                    {(profile.volunteering || []).map((vol, index) => (
                        <div key={vol.id || index} className={styles.entryCard}>
                            {renderEntryHeader('volunteering', index, 'Volunteering')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Organization"
                                    value={vol.organization}
                                    onChange={(e) =>
                                        updateSection('volunteering', index, 'organization', e.target.value)
                                    }
                                    required
                                    error={fieldError('volunteering', index, 'organization')}
                                />
                                <Input
                                    label="Role"
                                    value={vol.role}
                                    onChange={(e) =>
                                        updateSection('volunteering', index, 'role', e.target.value)
                                    }
                                    required
                                    error={fieldError('volunteering', index, 'role')}
                                />
                                <Input
                                    label="Location"
                                    value={vol.location || ''}
                                    onChange={(e) =>
                                        updateSection('volunteering', index, 'location', e.target.value)
                                    }
                                />
                                <MonthDurationRow
                                    startDate={vol.start_date || ''}
                                    endDate={vol.end_date}
                                    ongoing={isOngoingEntry(vol.end_date)}
                                    onStartChange={(value) =>
                                        updateSection('volunteering', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('volunteering', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) =>
                                        updateSection(
                                            'volunteering',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        )
                                    }
                                    ongoingLabel="I currently volunteer here"
                                    startError={fieldError('volunteering', index, 'start_date')}
                                    endError={fieldError('volunteering', index, 'end_date')}
                                    disabled={!isSectionEditing('volunteering')}
                                />
                                <Textarea
                                    label="Description"
                                    value={vol.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'volunteering',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('volunteering', index, 'description')}
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('volunteering') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('volunteering', emptyVolunteering)}
                    >
                        + Add Volunteering
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Organizations */}
            <ProfileSectionCard
                id={SECTION_IDS.organizations}
                title="Organizations"
                isEditing={isSectionEditing('organizations')}
                isSaving={savingSection === 'organizations'}
                saveSuccess={sectionSaveSuccess === 'organizations'}
                onEdit={() => startSectionEdit('organizations')}
                onSave={() => saveSection('organizations')}
                onCancel={() => cancelSectionEdit('organizations')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('organizations')}
                    className={styles.form}
                >
                    {(profile.organizations || []).map((org, index) => (
                        <div key={org.id || index} className={styles.entryCard}>
                            {renderEntryHeader('organizations', index, 'Organization')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Name"
                                    value={org.name}
                                    onChange={(e) =>
                                        updateSection('organizations', index, 'name', e.target.value)
                                    }
                                    required
                                    error={fieldError('organizations', index, 'name')}
                                />
                                <Input
                                    label="Role"
                                    value={org.role}
                                    onChange={(e) =>
                                        updateSection('organizations', index, 'role', e.target.value)
                                    }
                                    required
                                    error={fieldError('organizations', index, 'role')}
                                />
                                <Input
                                    label="Location"
                                    value={org.location || ''}
                                    onChange={(e) =>
                                        updateSection('organizations', index, 'location', e.target.value)
                                    }
                                />
                                <MonthDurationRow
                                    startDate={org.start_date || ''}
                                    endDate={org.end_date}
                                    ongoing={isOngoingEntry(org.end_date)}
                                    onStartChange={(value) =>
                                        updateSection('organizations', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('organizations', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) =>
                                        updateSection(
                                            'organizations',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        )
                                    }
                                    ongoingLabel="I am currently a member"
                                    startError={fieldError('organizations', index, 'start_date')}
                                    endError={fieldError('organizations', index, 'end_date')}
                                    disabled={!isSectionEditing('organizations')}
                                />
                                <Textarea
                                    label="Description"
                                    value={org.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'organizations',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('organizations', index, 'description')}
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('organizations') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('organizations', emptyOrganization)}
                    >
                        + Add Organization
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Positions */}
            <ProfileSectionCard
                id={SECTION_IDS.positions}
                title="Positions"
                isEditing={isSectionEditing('positions')}
                isSaving={savingSection === 'positions'}
                saveSuccess={sectionSaveSuccess === 'positions'}
                onEdit={() => startSectionEdit('positions')}
                onSave={() => saveSection('positions')}
                onCancel={() => cancelSectionEdit('positions')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('positions')}
                    className={styles.form}
                >
                    {(profile.positions || []).map((pos, index) => (
                        <div key={pos.id || index} className={styles.entryCard}>
                            {renderEntryHeader('positions', index, 'Position')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Title"
                                    value={pos.title}
                                    onChange={(e) =>
                                        updateSection('positions', index, 'title', e.target.value)
                                    }
                                    required
                                    error={fieldError('positions', index, 'title')}
                                />
                                <Input
                                    label="Organization"
                                    value={pos.organization}
                                    onChange={(e) =>
                                        updateSection(
                                            'positions',
                                            index,
                                            'organization',
                                            e.target.value
                                        )
                                    }
                                    required
                                    error={fieldError('positions', index, 'organization')}
                                />
                                <Input
                                    label="Location"
                                    value={pos.location || ''}
                                    onChange={(e) =>
                                        updateSection('positions', index, 'location', e.target.value)
                                    }
                                />
                                <MonthDurationRow
                                    startDate={pos.start_date || ''}
                                    endDate={pos.end_date}
                                    ongoing={isOngoingEntry(pos.end_date)}
                                    onStartChange={(value) =>
                                        updateSection('positions', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('positions', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) =>
                                        updateSection(
                                            'positions',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        )
                                    }
                                    ongoingLabel="I currently hold this position"
                                    startError={fieldError('positions', index, 'start_date')}
                                    endError={fieldError('positions', index, 'end_date')}
                                    disabled={!isSectionEditing('positions')}
                                />
                                <Textarea
                                    label="Description"
                                    value={pos.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'positions',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('positions', index, 'description')}
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('positions') && (
                    <Button variant="secondary" onClick={() => addSectionItem('positions', emptyPosition)}>
                        + Add Position
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Career Breaks */}
            <ProfileSectionCard
                id={SECTION_IDS.career_breaks}
                title="Career Breaks"
                isEditing={isSectionEditing('career_breaks')}
                isSaving={savingSection === 'career_breaks'}
                saveSuccess={sectionSaveSuccess === 'career_breaks'}
                onEdit={() => startSectionEdit('career_breaks')}
                onSave={() => saveSection('career_breaks')}
                onCancel={() => cancelSectionEdit('career_breaks')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('career_breaks')}
                    className={styles.form}
                >
                    {(profile.career_breaks || []).map((cb, index) => (
                        <div key={cb.id || index} className={styles.entryCard}>
                            {renderEntryHeader('career_breaks', index, 'Career Break')}
                            <div className={styles.entryFields}>
                                <Select
                                    label="Reason"
                                    value={cb.reason || ''}
                                    onChange={(value) =>
                                        updateSection('career_breaks', index, 'reason', value)
                                    }
                                    options={CAREER_BREAK_REASONS}
                                    placeholder="Select reason"
                                    required
                                    error={fieldError('career_breaks', index, 'reason')}
                                />
                                <MonthDurationRow
                                    startDate={cb.start_date || ''}
                                    endDate={cb.end_date}
                                    ongoing={isOngoingEntry(cb.end_date)}
                                    onStartChange={(value) =>
                                        updateSection('career_breaks', index, 'start_date', value)
                                    }
                                    onEndChange={(value) =>
                                        updateSection('career_breaks', index, 'end_date', value)
                                    }
                                    onOngoingChange={(ongoing) =>
                                        updateSection(
                                            'career_breaks',
                                            index,
                                            'end_date',
                                            ongoing ? null : ''
                                        )
                                    }
                                    ongoingLabel="This break is ongoing"
                                    startError={fieldError('career_breaks', index, 'start_date')}
                                    endError={fieldError('career_breaks', index, 'end_date')}
                                    disabled={!isSectionEditing('career_breaks')}
                                />
                                <Textarea
                                    label="Description"
                                    value={cb.description || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'career_breaks',
                                            index,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    required
                                    error={fieldError('career_breaks', index, 'description')}
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('career_breaks') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('career_breaks', emptyCareerBreak)}
                    >
                        + Add Career Break
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Languages */}
            <ProfileSectionCard
                id={SECTION_IDS.languages}
                title="Languages"
                isEditing={isSectionEditing('languages')}
                isSaving={savingSection === 'languages'}
                saveSuccess={sectionSaveSuccess === 'languages'}
                onEdit={() => startSectionEdit('languages')}
                onSave={() => saveSection('languages')}
                onCancel={() => cancelSectionEdit('languages')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('languages')}
                    className={styles.form}
                >
                    {(profile.languages || []).map((lang, index) => (
                        <div key={index} className={styles.entryCard}>
                            {renderEntryHeader('languages', index, 'Language')}
                            <div className={styles.entryFields}>
                                <LanguageSelect
                                    value={lang.language}
                                    onChange={(value) =>
                                        updateSection('languages', index, 'language', value)
                                    }
                                    required
                                    disabled={!isSectionEditing('languages')}
                                    error={fieldError('languages', index, 'language')}
                                />
                                <ProficiencySelect
                                    label="Read"
                                    value={lang.read_proficiency || ''}
                                    onChange={(value) =>
                                        updateSection('languages', index, 'read_proficiency', value)
                                    }
                                    required
                                    disabled={!isSectionEditing('languages')}
                                    error={fieldError('languages', index, 'read_proficiency')}
                                />
                                <ProficiencySelect
                                    label="Write"
                                    value={lang.write_proficiency || ''}
                                    onChange={(value) =>
                                        updateSection('languages', index, 'write_proficiency', value)
                                    }
                                    required
                                    disabled={!isSectionEditing('languages')}
                                    error={fieldError('languages', index, 'write_proficiency')}
                                />
                                <ProficiencySelect
                                    label="Speak"
                                    value={lang.speak_proficiency || ''}
                                    onChange={(value) =>
                                        updateSection('languages', index, 'speak_proficiency', value)
                                    }
                                    required
                                    disabled={!isSectionEditing('languages')}
                                    error={fieldError('languages', index, 'speak_proficiency')}
                                />
                                <Input
                                    label="Certification"
                                    value={lang.certification || ''}
                                    onChange={(e) =>
                                        updateSection(
                                            'languages',
                                            index,
                                            'certification',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('languages') && (
                    <Button variant="secondary" onClick={() => addSectionItem('languages', emptyLanguage)}>
                        + Add Language
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Test Scores */}
            <ProfileSectionCard
                id={SECTION_IDS.test_scores}
                title="Test Scores"
                isEditing={isSectionEditing('test_scores')}
                isSaving={savingSection === 'test_scores'}
                saveSuccess={sectionSaveSuccess === 'test_scores'}
                onEdit={() => startSectionEdit('test_scores')}
                onSave={() => saveSection('test_scores')}
                onCancel={() => cancelSectionEdit('test_scores')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('test_scores')}
                    className={styles.form}
                >
                    {(profile.test_scores || []).map((score, index) => (
                        <div key={score.id || index} className={styles.entryCard}>
                            {renderEntryHeader('test_scores', index, 'Test Score')}
                            <div className={styles.entryFields}>
                                <Input
                                    label="Test Name"
                                    value={score.test_name}
                                    onChange={(e) =>
                                        updateSection('test_scores', index, 'test_name', e.target.value)
                                    }
                                    required
                                    error={fieldError('test_scores', index, 'test_name')}
                                />
                                <Input
                                    label="Score"
                                    value={score.score}
                                    onChange={(e) =>
                                        updateSection('test_scores', index, 'score', e.target.value)
                                    }
                                    required
                                    error={fieldError('test_scores', index, 'score')}
                                />
                                <Input
                                    label="Max Score"
                                    type="number"
                                    value={
                                        score.max_score === undefined || score.max_score === null
                                            ? ''
                                            : String(score.max_score)
                                    }
                                    onChange={(e) =>
                                        updateSection(
                                            'test_scores',
                                            index,
                                            'max_score',
                                            e.target.value === '' ? null : Number(e.target.value)
                                        )
                                    }
                                />
                                <Input
                                    label="Percentile"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={
                                        score.percentile === undefined || score.percentile === null
                                            ? ''
                                            : String(score.percentile)
                                    }
                                    onChange={(e) =>
                                        updateSection(
                                            'test_scores',
                                            index,
                                            'percentile',
                                            e.target.value === '' ? null : Number(e.target.value)
                                        )
                                    }
                                />
                                <Input
                                    label="Date"
                                    type="month"
                                    value={dateToMonthValue(score.date || '')}
                                    onChange={(e) =>
                                        updateSection(
                                            'test_scores',
                                            index,
                                            'date',
                                            monthValueToApiDate(e.target.value)
                                        )
                                    }
                                    helperText="Month and year only"
                                    required
                                    error={fieldError('test_scores', index, 'date')}
                                />
                            </div>
                        </div>
                    ))}
                </ProfileSectionFieldset>
                {isSectionEditing('test_scores') && (
                    <Button
                        variant="secondary"
                        onClick={() => addSectionItem('test_scores', emptyTestScore)}
                    >
                        + Add Test Score
                    </Button>
                )}
            </ProfileSectionCard>

            {/* Areas of Interest */}
            <ProfileSectionCard
                id={SECTION_IDS.areas_of_interest}
                title="Areas of Interest"
                isEditing={isSectionEditing('areas_of_interest')}
                isSaving={savingSection === 'areas_of_interest'}
                saveSuccess={sectionSaveSuccess === 'areas_of_interest'}
                onEdit={() => startSectionEdit('areas_of_interest')}
                onSave={() => saveSection('areas_of_interest')}
                onCancel={() => cancelSectionEdit('areas_of_interest')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('areas_of_interest')}
                    className={styles.form}
                >
                    <TagInput
                        label="Areas of Interest"
                        values={profile.areas_of_interest || []}
                        onChange={(values) => updateTagArray('areas_of_interest', values)}
                        placeholder="e.g., Machine Learning, Open Source"
                        disabled={!isSectionEditing('areas_of_interest')}
                    />
                </ProfileSectionFieldset>
            </ProfileSectionCard>

            {/* Hobbies */}
            <ProfileSectionCard
                id={SECTION_IDS.hobbies}
                title="Hobbies"
                isEditing={isSectionEditing('hobbies')}
                isSaving={savingSection === 'hobbies'}
                saveSuccess={sectionSaveSuccess === 'hobbies'}
                onEdit={() => startSectionEdit('hobbies')}
                onSave={() => saveSection('hobbies')}
                onCancel={() => cancelSectionEdit('hobbies')}
            >
                <ProfileSectionFieldset
                    isEditing={isSectionEditing('hobbies')}
                    className={styles.form}
                >
                    <TagInput
                        label="Hobbies"
                        values={profile.hobbies || []}
                        onChange={(values) => updateTagArray('hobbies', values)}
                        placeholder="e.g., Reading, Hiking"
                        disabled={!isSectionEditing('hobbies')}
                    />
                </ProfileSectionFieldset>
            </ProfileSectionCard>
        </>
    );
}
