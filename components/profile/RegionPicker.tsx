'use client';

import { useEffect, useState } from 'react';
import { Country, State } from 'country-state-city';
import { Select } from '@/components/ui/Select';
import { composeRegion, parseRegion, ParsedRegion } from '@/lib/validation/region';

export type { ParsedRegion };
export { parseRegion, isRegionComplete } from '@/lib/validation/region';

interface RegionPickerProps {
    value: string;
    onChange: (location: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export function RegionPicker({ value, onChange, error, required, disabled }: RegionPickerProps) {
    const countries = Country.getAllCountries();
    const [countryCode, setCountryCode] = useState('');
    const [stateCode, setStateCode] = useState('');

    useEffect(() => {
        if (!value) {
            setCountryCode('');
            setStateCode('');
            return;
        }

        const parsed = parseRegion(value);
        if (parsed) {
            setCountryCode(parsed.countryCode);
            setStateCode(parsed.stateCode);
        }
    }, [value]);

    const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

    const emitRegion = (nextCountryCode: string, nextStateCode: string) => {
        const country = countries.find((c) => c.isoCode === nextCountryCode) || null;
        const stateList = nextCountryCode ? State.getStatesOfCountry(nextCountryCode) : [];
        const state = stateList.find((s) => s.isoCode === nextStateCode) || null;
        onChange(composeRegion(state?.name || '', country?.name || ''));
    };

    const countryOptions = countries.map((country) => ({
        value: country.isoCode,
        label: country.name,
    }));

    const stateOptions = states.map((state) => ({
        value: state.isoCode,
        label: state.name,
    }));

    return (
        <div className="space-y-4">
            <Select
                label="Country"
                required={required}
                value={countryCode}
                onChange={(nextCountry) => {
                    setCountryCode(nextCountry);
                    setStateCode('');
                    onChange('');
                }}
                options={countryOptions}
                placeholder="Select country"
                disabled={disabled}
            />
            <Select
                label="State"
                required={required}
                value={stateCode}
                onChange={(nextState) => {
                    setStateCode(nextState);
                    emitRegion(countryCode, nextState);
                }}
                options={stateOptions}
                placeholder="Select state"
                disabled={disabled || !countryCode}
                error={error}
                helperText={
                    value ? `Selected: ${value}` : 'Select country and state.'
                }
            />
        </div>
    );
}
