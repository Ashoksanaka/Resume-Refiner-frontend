import { render, screen, fireEvent } from '@testing-library/react';
import { LocationPicker } from '@/components/profile/LocationPicker';

jest.mock('country-state-city', () => ({
    Country: {
        getAllCountries: () => [
            { isoCode: 'IN', name: 'India' },
            { isoCode: 'US', name: 'United States' },
        ],
    },
    State: {
        getStatesOfCountry: (countryCode: string) =>
            countryCode === 'IN'
                ? [{ isoCode: 'MH', name: 'Maharashtra' }]
                : [{ isoCode: 'CA', name: 'California' }],
    },
    City: {
        getCitiesOfState: (countryCode: string, stateCode: string) => {
            if (countryCode === 'IN' && stateCode === 'MH') {
                return [{ name: 'Mumbai' }];
            }
            return [{ name: 'San Francisco' }];
        },
    },
}));

async function selectOption(label: RegExp, optionName: string) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    fireEvent.click(await screen.findByRole('option', { name: optionName }));
}

describe('LocationPicker', () => {
    it('composes location when country, state, and city are selected', async () => {
        const onChange = jest.fn();

        render(<LocationPicker value="" onChange={onChange} required />);

        await selectOption(/country/i, 'India');
        await selectOption(/state/i, 'Maharashtra');
        await selectOption(/city/i, 'Mumbai');

        expect(onChange).toHaveBeenLastCalledWith('Mumbai, Maharashtra, India');
    });

    it('hydrates dropdowns from a saved location value', async () => {
        const onChange = jest.fn();

        render(
            <LocationPicker
                value="Mumbai, Maharashtra, India"
                onChange={onChange}
                required
            />
        );

        expect(await screen.findByRole('button', { name: /country/i })).toHaveTextContent('India');
        expect(screen.getByRole('button', { name: /state/i })).toHaveTextContent('Maharashtra');
        expect(screen.getByRole('button', { name: /city/i })).toHaveTextContent('Mumbai');
        expect(screen.getByText('Selected: Mumbai, Maharashtra, India')).toBeInTheDocument();
    });
});
