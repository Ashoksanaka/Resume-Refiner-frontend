'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import styles from '@/app/(dashboard)/profile/page.module.css';

interface TagInputProps {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

export function TagInput({
    label,
    values,
    onChange,
    placeholder = 'Type and press Enter',
    disabled = false,
    required,
    error,
}: TagInputProps) {
    const [input, setInput] = useState('');

    const addValue = () => {
        const next = input.trim();
        if (!next || values.includes(next)) {
            return;
        }
        onChange([...values, next]);
        setInput('');
    };

    const removeValue = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div>
            {!disabled && (
                <div className={styles.skillInput}>
                    <Input
                        label={label}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        required={required && values.length === 0}
                        error={error}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addValue();
                            }
                        }}
                    />
                    <Button variant="secondary" type="button" onClick={addValue}>
                        Add
                    </Button>
                </div>
            )}
            {disabled && label && (
                <p className={styles.tagLabel}>{label}</p>
            )}
            <div className={styles.skillsList}>
                {values.map((value, index) => (
                    <span key={`${value}-${index}`} className={styles.skillTag}>
                        {value}
                        {!disabled && (
                            <button
                                type="button"
                                className={styles.skillRemove}
                                onClick={() => removeValue(index)}
                                aria-label={`Remove ${value}`}
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
            </div>
            {disabled && error && <span className={styles.inlineError}>{error}</span>}
        </div>
    );
}
