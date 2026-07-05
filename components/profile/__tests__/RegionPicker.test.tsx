import { render, screen, fireEvent } from '@testing-library/react';
import { RegionPicker } from '@/components/profile/RegionPicker';

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
}));

async function selectOption(label: RegExp, optionName: string) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    fireEvent.click(await screen.findByRole('option', { name: optionName }));
}

describe('RegionPicker', () => {
    it('composes region when country and state are selected', async () => {
        const onChange = jest.fn();

        render(<RegionPicker value="" onChange={onChange} required />);

        await selectOption(/country/i, 'India');
        await selectOption(/state/i, 'Maharashtra');

        expect(onChange).toHaveBeenLastCalledWith('Maharashtra, India');
    });

    it('hydrates dropdowns from a saved region value', async () => {
        const onChange = jest.fn();

        render(
            <RegionPicker
                value="Maharashtra, India"
                onChange={onChange}
                required
            />
        );

        expect(await screen.findByRole('button', { name: /country/i })).toHaveTextContent('India');
        expect(screen.getByRole('button', { name: /state/i })).toHaveTextContent('Maharashtra');
        expect(screen.getByText('Selected: Maharashtra, India')).toBeInTheDocument();
    });
});
