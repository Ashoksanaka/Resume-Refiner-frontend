'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { WORLD_LANGUAGES } from '@/lib/data/languages';

interface LanguageSelectProps {
    value: string;
    onChange: (languageName: string) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

export function LanguageSelect({ value, onChange, required, disabled, error }: LanguageSelectProps) {
    const [search, setSearch] = useState('');

    const options = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = query
            ? WORLD_LANGUAGES.filter(
                  (lang) =>
                      lang.name.toLowerCase().includes(query) ||
                      lang.code.toLowerCase().includes(query)
              )
            : WORLD_LANGUAGES;
        return filtered.map((lang) => ({ value: lang.name, label: lang.name }));
    }, [search]);

    return (
        <div className="space-y-2">
            {!disabled && (
                <Input
                    label="Search language"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to filter languages"
                />
            )}
            <Select
                label="Language"
                value={value}
                onChange={onChange}
                options={options}
                placeholder="Select language"
                required={required}
                disabled={disabled}
                error={error}
            />
        </div>
    );
}
