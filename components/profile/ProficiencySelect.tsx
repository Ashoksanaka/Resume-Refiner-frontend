'use client';

import { Select } from '@/components/ui/Select';
import { LanguageProficiencyLevel } from '@/types/api';

export const PROFICIENCY_OPTIONS: { value: LanguageProficiencyLevel; label: string }[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'native', label: 'Native' },
];

interface ProficiencySelectProps {
    label: string;
    value: LanguageProficiencyLevel | '';
    onChange: (value: LanguageProficiencyLevel) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

export function ProficiencySelect({
    label,
    value,
    onChange,
    required,
    disabled,
    error,
}: ProficiencySelectProps) {
    return (
        <Select
            label={label}
            value={value}
            onChange={(next) => onChange(next as LanguageProficiencyLevel)}
            options={PROFICIENCY_OPTIONS}
            placeholder="Select level"
            required={required}
            disabled={disabled}
            error={error}
        />
    );
}
