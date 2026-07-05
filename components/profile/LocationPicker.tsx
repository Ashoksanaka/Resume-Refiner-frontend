'use client';

import { useEffect, useMemo, useState } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Select } from '@/components/ui/Select';

interface LocationPickerProps {
    value: string;
    onChange: (location: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export interface ParsedLocation {
    countryCode: string;
    stateCode: string;
    cityName: string;
}

function composeLocation(city: ICity | null, state: IState | null, country: ICountry | null): string {
    if (!city || !state || !country) {
        return '';
    }
    return `${city.name}, ${state.name}, ${country.name}`;
}

export function parseLocation(value: string): ParsedLocation | null {
    const parts = value.split(',').map((part) => part.trim());
    if (parts.length !== 3) {
        return null;
    }

    const [cityName, stateName, countryName] = parts;
    const country = Country.getAllCountries().find((entry) => entry.name === countryName);
    if (!country) {
        return null;
    }

    const state = State.getStatesOfCountry(country.isoCode).find((entry) => entry.name === stateName);
    if (!state) {
        return null;
    }

    const city = City.getCitiesOfState(country.isoCode, state.isoCode).find(
        (entry) => entry.name === cityName
    );
    if (!city) {
        return null;
    }

    return {
        countryCode: country.isoCode,
        stateCode: state.isoCode,
        cityName: city.name,
    };
}

export function LocationPicker({ value, onChange, error, required, disabled }: LocationPickerProps) {
    const countries = useMemo(() => Country.getAllCountries(), []);
    const [countryCode, setCountryCode] = useState('');
    const [stateCode, setStateCode] = useState('');
    const [cityName, setCityName] = useState('');

    useEffect(() => {
        if (!value) {
            setCountryCode('');
            setStateCode('');
            setCityName('');
            return;
        }

        const parsed = parseLocation(value);
        if (parsed) {
            setCountryCode(parsed.countryCode);
            setStateCode(parsed.stateCode);
            setCityName(parsed.cityName);
        }
    }, [value]);

    const states = useMemo(
        () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
        [countryCode]
    );

    const cities = useMemo(
        () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
        [countryCode, stateCode]
    );

    const emitLocation = (nextCountryCode: string, nextStateCode: string, nextCityName: string) => {
        const country = countries.find((c) => c.isoCode === nextCountryCode) || null;
        const stateList = nextCountryCode ? State.getStatesOfCountry(nextCountryCode) : [];
        const state = stateList.find((s) => s.isoCode === nextStateCode) || null;
        const cityList =
            nextCountryCode && nextStateCode
                ? City.getCitiesOfState(nextCountryCode, nextStateCode)
                : [];
        const city = cityList.find((c) => c.name === nextCityName) || null;
        onChange(composeLocation(city, state, country));
    };

    const countryOptions = countries.map((country) => ({
        value: country.isoCode,
        label: country.name,
    }));

    const stateOptions = states.map((state) => ({
        value: state.isoCode,
        label: state.name,
    }));

    const cityOptions = cities.map((city) => ({
        value: city.name,
        label: city.name,
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
                    setCityName('');
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
                    setCityName('');
                    emitLocation(countryCode, nextState, '');
                }}
                options={stateOptions}
                placeholder="Select state"
                disabled={disabled || !countryCode}
            />
            <Select
                label="City"
                required={required}
                value={cityName}
                onChange={(nextCity) => {
                    setCityName(nextCity);
                    emitLocation(countryCode, stateCode, nextCity);
                }}
                options={cityOptions}
                placeholder="Select city"
                disabled={disabled || !stateCode}
                error={error}
                helperText={
                    value
                        ? `Selected: ${value}`
                        : 'Select country, state, and city.'
                }
            />
        </div>
    );
}

export function isLocationComplete(location: string): boolean {
    const parts = location.split(',').map((part) => part.trim());
    return parts.length === 3 && parts.every(Boolean);
}
