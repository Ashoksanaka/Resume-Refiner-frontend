import {
    migrateLanguage,
    migratePublication,
    validateProjects,
    validateLanguages,
    hasEntryErrors,
} from '@/lib/validation/profileSections';
import { Project, Language, Publication } from '@/types/api';

describe('profileSections validation', () => {
    it('validates required project fields', () => {
        const errors = validateProjects([
            {
                id: '1',
                title: 'App',
                role: 'Lead',
                description: '',
                start_date: '2020-01-01',
                end_date: '2021-01-01',
                ongoing: false,
            } as Project,
        ]);

        expect(errors[0]?.description).toBeDefined();
        expect(hasEntryErrors(errors)).toBe(true);
    });

    it('migrates legacy publication authors from strings', () => {
        const migrated = migratePublication({
            id: '1',
            title: 'Paper',
            authors: ['Jane Doe'] as unknown as Publication['authors'],
        });

        expect(migrated.authors[0]?.name).toBe('Jane Doe');
    });

    it('migrates legacy language proficiency into read/write/speak', () => {
        const migrated = migrateLanguage({
            language: 'English',
            proficiency: 'native',
            read_proficiency: '',
            write_proficiency: '',
            speak_proficiency: '',
        });

        expect(migrated.read_proficiency).toBe('native');
        expect(migrated.write_proficiency).toBe('native');
        expect(migrated.speak_proficiency).toBe('native');
    });

    it('requires all three language proficiencies', () => {
        const errors = validateLanguages([
            {
                language: 'English',
                read_proficiency: 'native',
                write_proficiency: '',
                speak_proficiency: '',
            },
        ]);

        expect(errors[0]?.write_proficiency).toBeDefined();
        expect(errors[0]?.speak_proficiency).toBeDefined();
    });
});
