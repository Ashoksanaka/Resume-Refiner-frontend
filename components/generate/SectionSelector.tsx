'use client';

import { Profile } from '@/types/api';
import {
    ProfileSectionKey,
    ProfileSectionOption,
    RECOMMENDED_SECTION_KEYS,
    getPopulatedSections,
} from '@/lib/constants/profileSections';
import styles from './SectionSelector.module.css';

interface SectionSelectorProps {
    profile: Profile;
    selectedSections: Set<ProfileSectionKey>;
    onChange: (sections: Set<ProfileSectionKey>) => void;
}

export function SectionSelector({
    profile,
    selectedSections,
    onChange,
}: SectionSelectorProps) {
    const availableSections = getPopulatedSections(profile);
    const allSelected =
        availableSections.length > 0 &&
        availableSections.every((s) => selectedSections.has(s.key));
    const someSelected =
        availableSections.some((s) => selectedSections.has(s.key)) && !allSelected;

    const toggleSection = (key: ProfileSectionKey) => {
        const next = new Set(selectedSections);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        onChange(next);
    };

    const toggleAll = () => {
        if (allSelected) {
            onChange(new Set());
        } else {
            onChange(new Set(availableSections.map((s) => s.key)));
        }
    };

    if (availableSections.length === 0) {
        return (
            <div className={styles.container}>
                <p className={styles.emptyMessage}>
                    No profile sections have data yet. Complete your profile before generating a resume.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Include profile sections</h3>
                <p className={styles.subtitle}>
                    Choose which parts of your profile the AI should use for this resume.
                </p>
            </div>

            <div className={styles.selectAllRow}>
                <input
                    type="checkbox"
                    id="select-all-sections"
                    className={styles.checkbox}
                    checked={allSelected}
                    ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                />
                <label htmlFor="select-all-sections" className={styles.selectAllLabel}>
                    Select all sections
                </label>
            </div>

            <div className={styles.grid}>
                {availableSections.map((section: ProfileSectionOption) => {
                    const isRecommended = RECOMMENDED_SECTION_KEYS.includes(section.key);
                    const inputId = `section-${section.key}`;

                    return (
                        <div key={section.key} className={styles.sectionRow}>
                            <input
                                type="checkbox"
                                id={inputId}
                                className={styles.checkbox}
                                checked={selectedSections.has(section.key)}
                                onChange={() => toggleSection(section.key)}
                            />
                            <label htmlFor={inputId} className={styles.sectionLabel}>
                                {section.label}
                                {isRecommended && (
                                    <span className={styles.recommendedBadge}>Recommended</span>
                                )}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
