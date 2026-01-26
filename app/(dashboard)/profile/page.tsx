'use client';

import { useState, useEffect, FormEvent } from 'react';
import { profileApi, ApiClientError } from '@/services/apiClient';
import {
    Profile,
    PersonalInfo,
    Experience,
    Education,
    Certification,
    Project,
    Achievement,
    Publication,
    Patent,
    Volunteering,
    License,
    Training,
    TestScore,
    Language,
    Organization,
    Position,
    CareerBreak,
} from '@/types/api';
import {
    Button,
    Input,
    Textarea,
    Card,
    Loading,
    ErrorDisplay,
} from '@/components/ui';
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
    end_date: null,
    description: '',
};

const emptyEducation: Education = {
    institution: '',
    degree: '',
    start_date: '',
    end_date: null,
    description: '',
};

const emptyCertification: Certification = {
    name: '',
    issuing_organization: '',
    issue_date: '',
};

// -------------------------------------------------
// Section Helpers
// -------------------------------------------------

const emptyProject: Project = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
    role: '',
    ongoing: false,
};

const emptyAchievement: Achievement = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
};

const emptyPublication: Publication = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
    authors: [],
};

const emptyPatent: Patent = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
    patent_number: '',
    status: 'pending',
};

const emptyVolunteering: Volunteering = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    organization: '',
    role: '',
};

const emptyLicense: License = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    name: '',
    issuer: '',
};

const emptyTraining: Training = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
    provider: '',
};

const emptyTestScore: TestScore = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    test_name: '',
    score: '',
};

const emptyLanguage: Language = {
    language: '',
    proficiency: 'conversational',
};

const emptyOrganization: Organization = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    name: '',
    role: '',
};

const emptyPosition: Position = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
    organization: '',
};

const emptyCareerBreak: CareerBreak = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    title: '',
};

// -------------------------------------------------
// Main Component
// -------------------------------------------------

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(emptyProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isNewProfile, setIsNewProfile] = useState(true);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileApi.get();
                setProfile(data);
                setIsNewProfile(false);
            } catch (err) {
                if (err instanceof ApiClientError && err.status === 404) {
                    // Profile doesn't exist yet, use empty profile
                    setIsNewProfile(true);
                } else {
                    setError(err as Error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Save profile
    const handleSave = async () => {
        setError(null);
        setSaveSuccess(false);
        setIsSaving(true);

        try {
            if (isNewProfile) {
                await profileApi.create(profile);
                setIsNewProfile(false);
            } else {
                await profileApi.update(profile);
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsSaving(false);
        }
    };

    // Update handlers
    const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
        setProfile((prev) => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value },
        }));
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
    };

    const updateEducation = (index: number, field: keyof Education, value: string | null) => {
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
    const updateSection = <T extends keyof Profile>(section: T, index: number, field: any, value: any) => {
        setProfile((prev) => {
            const arr = [...(prev[section] as any[] || [])];
            arr[index] = { ...arr[index], [field]: value };
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
            [section]: (prev[section] as any[] || []).filter((_, i) => i !== index),
        }));
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

            {saveSuccess && (
                <div className={styles.successMessage}>
                    ✓ Profile saved successfully
                </div>
            )}

            <div className="space-y-12 pb-24">
                {/* Personal Info Section */}
                <section id="personal" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Personal Info</h2>
                        <div className={styles.form}>
                            <Input
                                label="Full Name"
                                value={profile.personalInfo.full_name}
                                onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profile.personalInfo.email}
                                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                placeholder="john@example.com"
                                required
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                value={profile.personalInfo.phone_number || ''}
                                onChange={(e) => updatePersonalInfo('phone_number', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                            />
                            <Input
                                label="Location"
                                value={profile.personalInfo.location || ''}
                                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                placeholder="San Francisco, CA"
                            />
                            <Input
                                label="Portfolio URL"
                                type="url"
                                value={profile.personalInfo.portfolio_url || ''}
                                onChange={(e) => updatePersonalInfo('portfolio_url', e.target.value)}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </Card>
                </section>

                {/* Summary Section */}
                <section id="summary" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Professional Summary</h2>
                        <div className={styles.form}>
                            <Textarea
                                label="Summary"
                                value={profile.summary}
                                onChange={(e) => setProfile((prev) => ({ ...prev, summary: e.target.value }))}
                                placeholder="Write a compelling summary..."
                                maxLength={2500}
                                charCount
                                rows={8}
                            />
                        </div>
                    </Card>
                </section>

                {/* Experience Section */}
                <section id="experience" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Experience</h2>
                        <div className={styles.form}>
                            {profile.experience.map((exp, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Experience {index + 1}</span>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeExperience(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input
                                            label="Company"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            placeholder="Company Name"
                                            required
                                        />
                                        <Input
                                            label="Title"
                                            value={exp.title}
                                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                            placeholder="Job Title"
                                            required
                                        />
                                        <div className={styles.dateRow}>
                                            <Input
                                                label="Start Date"
                                                type="date"
                                                value={exp.start_date}
                                                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="End Date"
                                                type="date"
                                                value={exp.end_date || ''}
                                                onChange={(e) => updateExperience(index, 'end_date', e.target.value || null)}
                                            />
                                        </div>
                                        <Textarea
                                            label="Description"
                                            value={exp.description || ''}
                                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                            placeholder="Describe your responsibilities..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={addExperience}>
                                + Add Experience
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Education Section */}
                <section id="education" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Education</h2>
                        <div className={styles.form}>
                            {profile.education.map((edu, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Education {index + 1}</span>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeEducation(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input
                                            label="Institution"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                            placeholder="University Name"
                                            required
                                        />
                                        <Input
                                            label="Degree"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="B.S. in CS"
                                            required
                                        />
                                        <div className={styles.dateRow}>
                                            <Input
                                                label="Start Date"
                                                type="date"
                                                value={edu.start_date}
                                                onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="End Date"
                                                type="date"
                                                value={edu.end_date || ''}
                                                onChange={(e) => updateEducation(index, 'end_date', e.target.value || null)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={addEducation}>
                                + Add Education
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Skills Section */}
                <section id="skills" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Skills</h2>
                        <div className={styles.form}>
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
                            <div className={styles.skillsList}>
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className={styles.skillTag}>
                                        {skill}
                                        <button
                                            type="button"
                                            className={styles.skillRemove}
                                            onClick={() => removeSkill(index)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Projects Section */}
                <section id="projects" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Projects</h2>
                        <div className={styles.form}>
                            {(profile.projects || []).map((project, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Project {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('projects', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={project.title} onChange={(e) => updateSection('projects', index, 'title', e.target.value)} required />
                                        <Input label="Role" value={project.role} onChange={(e) => updateSection('projects', index, 'role', e.target.value)} required />
                                        <Textarea label="Description" value={project.description || ''} onChange={(e) => updateSection('projects', index, 'description', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('projects', emptyProject)}>+ Add Project</Button>
                        </div>
                    </Card>
                </section>

                {/* Achievements Section */}
                <section id="achievements" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Achievements</h2>
                        <div className={styles.form}>
                            {(profile.achievements || []).map((achievement, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Achievement {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('achievements', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={achievement.title} onChange={(e) => updateSection('achievements', index, 'title', e.target.value)} required />
                                        <Textarea label="Description" value={achievement.description || ''} onChange={(e) => updateSection('achievements', index, 'description', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('achievements', emptyAchievement)}>+ Add Achievement</Button>
                        </div>
                    </Card>
                </section>

                {/* Publications Section */}
                <section id="publications" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Publications</h2>
                        <div className={styles.form}>
                            {(profile.publications || []).map((pub, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Publication {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('publications', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={pub.title} onChange={(e) => updateSection('publications', index, 'title', e.target.value)} required />
                                        <Input label="Venue" value={pub.venue || ''} onChange={(e) => updateSection('publications', index, 'venue', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('publications', emptyPublication)}>+ Add Publication</Button>
                        </div>
                    </Card>
                </section>

                {/* Patents Section */}
                <section id="patents" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Patents</h2>
                        <div className={styles.form}>
                            {(profile.patents || []).map((patent, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Patent {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('patents', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={patent.title} onChange={(e) => updateSection('patents', index, 'title', e.target.value)} required />
                                        <Input label="Patent Number" value={patent.patent_number} onChange={(e) => updateSection('patents', index, 'patent_number', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('patents', emptyPatent)}>+ Add Patent</Button>
                        </div>
                    </Card>
                </section>

                {/* Licenses Section */}
                <section id="licenses" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Licenses</h2>
                        <div className={styles.form}>
                            {(profile.licenses || []).map((lic, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>License {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('licenses', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Name" value={lic.name} onChange={(e) => updateSection('licenses', index, 'name', e.target.value)} required />
                                        <Input label="Issuer" value={lic.issuer} onChange={(e) => updateSection('licenses', index, 'issuer', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('licenses', emptyLicense)}>+ Add License</Button>
                        </div>
                    </Card>
                </section>

                {/* Trainings Section */}
                <section id="trainings" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Trainings</h2>
                        <div className={styles.form}>
                            {(profile.trainings || []).map((training, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Training {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('trainings', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={training.title} onChange={(e) => updateSection('trainings', index, 'title', e.target.value)} required />
                                        <Input label="Provider" value={training.provider} onChange={(e) => updateSection('trainings', index, 'provider', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('trainings', emptyTraining)}>+ Add Training</Button>
                        </div>
                    </Card>
                </section>

                {/* Volunteering Section */}
                <section id="volunteering" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Volunteering</h2>
                        <div className={styles.form}>
                            {(profile.volunteering || []).map((vol, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Volunteering {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('volunteering', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Organization" value={vol.organization} onChange={(e) => updateSection('volunteering', index, 'organization', e.target.value)} required />
                                        <Input label="Role" value={vol.role} onChange={(e) => updateSection('volunteering', index, 'role', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('volunteering', emptyVolunteering)}>+ Add Volunteering</Button>
                        </div>
                    </Card>
                </section>

                {/* Organizations Section */}
                <section id="organizations" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Organizations</h2>
                        <div className={styles.form}>
                            {(profile.organizations || []).map((org, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Organization {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('organizations', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Name" value={org.name} onChange={(e) => updateSection('organizations', index, 'name', e.target.value)} required />
                                        <Input label="Role" value={org.role} onChange={(e) => updateSection('organizations', index, 'role', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('organizations', emptyOrganization)}>+ Add Organization</Button>
                        </div>
                    </Card>
                </section>

                {/* Positions Section */}
                <section id="positions" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Positions</h2>
                        <div className={styles.form}>
                            {(profile.positions || []).map((pos, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Position {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('positions', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={pos.title} onChange={(e) => updateSection('positions', index, 'title', e.target.value)} required />
                                        <Input label="Organization" value={pos.organization} onChange={(e) => updateSection('positions', index, 'organization', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('positions', emptyPosition)}>+ Add Position</Button>
                        </div>
                    </Card>
                </section>

                {/* Career Breaks Section */}
                <section id="career_breaks" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Career Breaks</h2>
                        <div className={styles.form}>
                            {(profile.career_breaks || []).map((cb, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Career Break {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('career_breaks', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Title" value={cb.title} onChange={(e) => updateSection('career_breaks', index, 'title', e.target.value)} required />
                                        <Textarea label="Description" value={cb.description || ''} onChange={(e) => updateSection('career_breaks', index, 'description', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('career_breaks', emptyCareerBreak)}>+ Add Career Break</Button>
                        </div>
                    </Card>
                </section>

                {/* Languages Section */}
                <section id="languages" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Languages</h2>
                        <div className={styles.form}>
                            {(profile.languages || []).map((lang, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Language {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('languages', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Language" value={lang.language} onChange={(e) => updateSection('languages', index, 'language', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('languages', emptyLanguage)}>+ Add Language</Button>
                        </div>
                    </Card>
                </section>

                {/* Test Scores Section */}
                <section id="test_scores" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Test Scores</h2>
                        <div className={styles.form}>
                            {(profile.test_scores || []).map((score, index) => (
                                <div key={index} className={styles.entryCard}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTitle}>Test Score {index + 1}</span>
                                        <button type="button" className={styles.removeButton} onClick={() => removeSectionItem('test_scores', index)}>Remove</button>
                                    </div>
                                    <div className={styles.entryFields}>
                                        <Input label="Test Name" value={score.test_name} onChange={(e) => updateSection('test_scores', index, 'test_name', e.target.value)} required />
                                        <Input label="Score" value={score.score} onChange={(e) => updateSection('test_scores', index, 'score', e.target.value)} required />
                                    </div>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={() => addSectionItem('test_scores', emptyTestScore)}>+ Add Test Score</Button>
                        </div>
                    </Card>
                </section>

                {/* Areas of Interest Section */}
                <section id="areas_of_interest" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Areas of Interest</h2>
                        <div className={styles.form}>
                            <Textarea
                                label="Interests"
                                value={(profile.areas_of_interest || []).join(', ')}
                                onChange={(e) => setProfile(prev => ({ ...prev, areas_of_interest: e.target.value.split(',').map(s => s.trim()) }))}
                                placeholder="e.g., Open Source, Machine Learning"
                            />
                        </div>
                    </Card>
                </section>

                {/* Hobbies Section */}
                <section id="hobbies" className="scroll-mt-20">
                    <Card className={styles.formCard}>
                        <h2 className="text-xl font-bold mb-6">Hobbies</h2>
                        <div className={styles.form}>
                            <Textarea
                                label="Hobbies"
                                value={(profile.hobbies || []).join(', ')}
                                onChange={(e) => setProfile(prev => ({ ...prev, hobbies: e.target.value.split(',').map(s => s.trim()) }))}
                                placeholder="e.g., Reading, Hiking"
                            />
                        </div>
                    </Card>
                </section>
            </div>

            <div className={styles.saveBar}>
                <Button onClick={handleSave} isLoading={isSaving} size="lg">
                    Save Profile
                </Button>
            </div>
        </div>
    );
}
