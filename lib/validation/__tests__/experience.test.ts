import {
    dateToMonthValue,
    hasExperienceErrors,
    isCurrentlyWorking,
    monthValueToApiDate,
    normalizeExperienceForApi,
    validateExperienceEntries,
} from '@/lib/validation/experience';
import { Experience } from '@/types/api';

const validExperience: Experience = {
    company: 'Tech Corp',
    title: 'Engineer',
    start_date: '2020-03-01',
    end_date: '2022-06-01',
    description: 'Built scalable services and led a small team.',
};

describe('experience validation helpers', () => {
    it('converts API dates to month values and back', () => {
        expect(dateToMonthValue('2020-03-15')).toBe('2020-03');
        expect(monthValueToApiDate('2020-03')).toBe('2020-03-01');
    });

    it('normalizes experience dates for API payloads', () => {
        expect(normalizeExperienceForApi(validExperience)).toEqual({
            ...validExperience,
            start_date: '2020-03-01',
            end_date: '2022-06-01',
        });
    });

    it('treats null end_date as currently working', () => {
        expect(isCurrentlyWorking({ ...validExperience, end_date: null })).toBe(true);
        expect(isCurrentlyWorking({ ...validExperience, end_date: '2022-06-01' })).toBe(false);
    });

    it('requires description and end date when not currently working', () => {
        const errors = validateExperienceEntries([
            {
                company: 'Tech Corp',
                title: 'Engineer',
                start_date: '2020-03-01',
                end_date: '',
                description: '',
            },
        ]);

        expect(errors[0]?.description).toBeDefined();
        expect(errors[0]?.end_date).toBeDefined();
        expect(hasExperienceErrors(errors)).toBe(true);
    });

    it('allows missing end date when currently working', () => {
        const errors = validateExperienceEntries([
            {
                ...validExperience,
                end_date: null,
            },
        ]);

        expect(errors[0]?.end_date).toBeUndefined();
        expect(hasExperienceErrors(errors)).toBe(false);
    });
});
