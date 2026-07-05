import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../app/(dashboard)/profile/page';
import { profileApi } from '@/services/apiClient';

// Mocks
jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: true })),
    useUser: jest.fn(() => ({
        user: {
            primaryEmailAddress: { emailAddress: 'john@example.com' },
        },
    })),
}));

jest.mock('@/services/apiClient', () => ({
    profileApi: {
        get: jest.fn(),
    },
    ApiClientError: class extends Error { status = 0; }
}));

describe('Profile Page Layout', () => {
    beforeEach(() => {
        (profileApi.get as jest.Mock).mockResolvedValue({
            personalInfo: {
                full_name: 'John Doe',
                email: 'john@example.com',
                phone_number: '+1-5551234567',
                location: 'San Francisco, California, United States',
            },
            summary: 'Prof summary',
            experience: [{ company: 'Google', title: 'Engineer', start_date: '2020-01-01', end_date: null, description: 'Built scalable backend services.' }],
            education: [],
            skills: ['React'],
            projects: [{ id: '1', title: 'Project A', role: 'Dev', ongoing: true }],
            achievements: [],
            publications: [],
            patents: [],
            volunteering: [],
            licenses: [],
            trainings: [],
            test_scores: [],
            languages: [],
            organizations: [],
            areas_of_interest: [],
            hobbies: [],
        });
    });

    it('renders all sections with correct anchor IDs', async () => {
        render(<ProfilePage />);

        // Wait for isLoading to be false
        expect(await screen.findByText('Your Profile')).toBeInTheDocument();

        // Check for sections
        const sections = [
            'personal', 'summary', 'experience', 'education', 'skills',
            'projects', 'achievements', 'publications', 'patents',
            'licenses', 'trainings', 'volunteering', 'organizations',
            'positions', 'career_breaks', 'languages', 'test_scores',
            'areas_of_interest', 'hobbies'
        ];

        sections.forEach(id => {
            expect(document.getElementById(id)).toBeInTheDocument();
        });
    });

    it('renders data from API correctly', async () => {
        render(<ProfilePage />);
        expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Google')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Project A')).toBeInTheDocument();
        expect(screen.getAllByText('Description').length).toBeGreaterThan(0);
    });
});
