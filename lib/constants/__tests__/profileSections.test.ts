import {
    sectionHasData,
    getDefaultSelectedSections,
    RECOMMENDED_SECTION_KEYS,
} from '@/lib/constants/profileSections';
import { Profile } from '@/types/api';

const sampleProfile: Profile = {
    personalInfo: {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone_number: '',
        location: 'NYC',
    },
    summary: 'Engineer',
    experience: [
        {
            company: 'Acme',
            title: 'Developer',
            start_date: '2020-01-01',
            description: 'Built things',
        },
    ],
    education: [],
    skills: ['Python'],
};

describe('profileSections constants', () => {
    it('detects populated sections', () => {
        expect(sectionHasData(sampleProfile, 'personalInfo')).toBe(true);
        expect(sectionHasData(sampleProfile, 'summary')).toBe(true);
        expect(sectionHasData(sampleProfile, 'experience')).toBe(true);
        expect(sectionHasData(sampleProfile, 'education')).toBe(false);
    });

    it('defaults to recommended populated sections', () => {
        const defaults = getDefaultSelectedSections(sampleProfile);
        expect(defaults.has('personalInfo')).toBe(true);
        expect(defaults.has('experience')).toBe(true);
        expect(defaults.has('education')).toBe(false);
        RECOMMENDED_SECTION_KEYS.forEach((key) => {
            if (sectionHasData(sampleProfile, key)) {
                expect(defaults.has(key)).toBe(true);
            }
        });
    });
});
