import {
    dateToMonthValue,
    hasEducationErrors,
    isCurrentlyStudying,
    isEducationSectionComplete,
    migrateLegacyEducation,
    monthValueToApiDate,
    normalizeEducationForApi,
    validateEducationEntries,
} from '@/lib/validation/education';
import { Education } from '@/types/api';

const validEducation: Education = {
    institution: 'State University',
    degree_level: "Bachelor's",
    course: 'BSc',
    specialization: 'Computer Science',
    location: 'Maharashtra, India',
    grade_type: 'cgpa',
    grade_value: 8.5,
    start_date: '2012-08-01',
    end_date: '2016-05-20',
};

describe('education validation helpers', () => {
    it('converts API dates to month values and back', () => {
        expect(dateToMonthValue('2012-08-15')).toBe('2012-08');
        expect(monthValueToApiDate('2012-08')).toBe('2012-08-01');
    });

    it('normalizes education dates for API payloads and drops legacy degree', () => {
        expect(
            normalizeEducationForApi([
                {
                    ...validEducation,
                    degree: 'Legacy degree',
                    start_date: '2012-08-15',
                    end_date: '2016-05-30',
                },
            ])
        ).toEqual([
            {
                ...validEducation,
                start_date: '2012-08-01',
                end_date: '2016-05-01',
            },
        ]);
    });

    it('treats null end_date as currently studying', () => {
        expect(isCurrentlyStudying({ ...validEducation, end_date: null })).toBe(true);
        expect(isCurrentlyStudying(validEducation)).toBe(false);
    });

    it('migrates legacy degree into course when degree_level is missing', () => {
        expect(
            migrateLegacyEducation([
                {
                    institution: 'Old College',
                    degree: 'B.Tech',
                    start_date: '2010-01-01',
                    end_date: '2014-01-01',
                } as Education,
            ])
        ).toEqual([
            expect.objectContaining({
                course: 'B.Tech',
            }),
        ]);
    });

    it('requires grade, location, and end date when not currently studying', () => {
        const errors = validateEducationEntries([
            {
                institution: 'State University',
                degree_level: "Bachelor's",
                course: 'BSc',
                specialization: 'Computer Science',
                location: '',
                grade_type: '',
                start_date: '2012-08-01',
                end_date: '',
            },
        ]);

        expect(errors[0]?.location).toBeDefined();
        expect(errors[0]?.grade_value).toBeDefined();
        expect(errors[0]?.end_date).toBeDefined();
        expect(hasEducationErrors(errors)).toBe(true);
    });

    it('validates grade ranges for percentage and cgpa', () => {
        const percentageErrors = validateEducationEntries([
            { ...validEducation, grade_type: 'percentage', grade_value: 150 },
        ]);
        expect(percentageErrors[0]?.grade_value).toContain('0 and 100');

        const cgpaErrors = validateEducationEntries([
            { ...validEducation, grade_type: 'cgpa', grade_value: 11 },
        ]);
        expect(cgpaErrors[0]?.grade_value).toContain('0 and 10');
    });

    it('allows missing end date when currently studying', () => {
        const errors = validateEducationEntries([
            {
                ...validEducation,
                end_date: null,
            },
        ]);

        expect(errors[0]?.end_date).toBeUndefined();
        expect(hasEducationErrors(errors)).toBe(false);
        expect(isEducationSectionComplete([{ ...validEducation, end_date: null }])).toBe(true);
    });
});
