import { Country, State } from 'country-state-city';

export interface ParsedRegion {
    countryCode: string;
    stateCode: string;
}

export function parseRegion(value: string): ParsedRegion | null {
    const parts = value.split(',').map((part) => part.trim());
    if (parts.length !== 2) {
        return null;
    }

    const [stateName, countryName] = parts;
    const country = Country.getAllCountries().find((entry) => entry.name === countryName);
    if (!country) {
        return null;
    }

    const state = State.getStatesOfCountry(country.isoCode).find((entry) => entry.name === stateName);
    if (!state) {
        return null;
    }

    return {
        countryCode: country.isoCode,
        stateCode: state.isoCode,
    };
}

export function isRegionComplete(location: string): boolean {
    const parts = location.split(',').map((part) => part.trim());
    return parts.length === 2 && parts.every(Boolean);
}

export function composeRegion(stateName: string, countryName: string): string {
    if (!stateName || !countryName) {
        return '';
    }
    return `${stateName}, ${countryName}`;
}
