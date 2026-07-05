import {
    isValidPhoneNumber,
    sanitizePhoneInput,
    validatePersonalInfo,
    validateProfileSummary,
    hasPersonalInfoErrors,
} from '@/lib/validation/personalInfo';
import { isLocationComplete } from '@/components/profile/LocationPicker';

describe('personalInfo validation', () => {
    const basePersonalInfo = {
        full_name: 'Jane Doe',
        email: 'test@example.com',
        phone_number: '+91-9876543210',
        location: 'Mumbai, Maharashtra, India',
    };

    it('accepts valid phone numbers', () => {
        expect(isValidPhoneNumber('+91-9876543210')).toBe(true);
        expect(isValidPhoneNumber('+1-5551234567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
        expect(isValidPhoneNumber('+1-555-123-4567')).toBe(false);
        expect(isValidPhoneNumber('9876543210')).toBe(false);
    });

    it('sanitizes phone input to allowed characters', () => {
        expect(sanitizePhoneInput('+91-9876543210abc')).toBe('+91-9876543210');
    });

    it('returns no errors for valid personal info', () => {
        const errors = validatePersonalInfo(basePersonalInfo, {
            locationSelected: isLocationComplete(basePersonalInfo.location),
        });
        expect(hasPersonalInfoErrors(errors)).toBe(false);
    });

    it('requires phone and location', () => {
        const errors = validatePersonalInfo(
            {
                ...basePersonalInfo,
                phone_number: '',
                location: '',
            },
            { locationSelected: false }
        );

        expect(errors.phone_number).toBeDefined();
        expect(errors.location).toBeDefined();
    });
});

describe('isLocationComplete', () => {
    it('returns true for city, state, country strings', () => {
        expect(isLocationComplete('Mumbai, Maharashtra, India')).toBe(true);
    });

    it('returns false for incomplete location strings', () => {
        expect(isLocationComplete('Mumbai, India')).toBe(false);
        expect(isLocationComplete('')).toBe(false);
    });
});

describe('validateProfileSummary', () => {
    it('requires a non-empty summary', () => {
        expect(validateProfileSummary('')).toBeDefined();
        expect(validateProfileSummary('   ')).toBeDefined();
    });

    it('requires at least 10 characters', () => {
        expect(validateProfileSummary('Too short')).toBeDefined();
    });

    it('accepts valid summaries', () => {
        expect(validateProfileSummary('Experienced engineer with full-stack skills.')).toBeUndefined();
    });
});
