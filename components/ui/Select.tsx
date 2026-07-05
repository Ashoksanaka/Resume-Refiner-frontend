'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    helperText?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
}

export function Select({
    label,
    options,
    value = '',
    onChange,
    error,
    helperText,
    placeholder = 'Select...',
    required,
    disabled,
    id,
    className,
}: SelectProps) {
    const generatedId = useId();
    const selectId = id || generatedId;
    const listboxId = `${selectId}-listbox`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText && !error ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === value);
    const displayLabel = selectedOption?.label || placeholder;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (nextValue: string) => {
        onChange?.(nextValue);
        setIsOpen(false);
    };

    return (
        <div className={`${styles.wrapper} ${className || ''}`} ref={containerRef}>
            <label id={`${selectId}-label`} htmlFor={selectId} className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>

            <div className={styles.combobox}>
                <button
                    id={selectId}
                    type="button"
                    className={`${styles.trigger} ${error ? styles.triggerError : ''} ${
                        !selectedOption ? styles.triggerPlaceholder : ''
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-labelledby={`${selectId}-label`}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    disabled={disabled}
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen((open) => !open);
                        }
                    }}
                >
                    <span className={styles.triggerText}>{displayLabel}</span>
                    <ChevronDown
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                        aria-hidden="true"
                    />
                </button>

                {isOpen && !disabled && (
                    <ul id={listboxId} role="listbox" className={styles.listbox} aria-labelledby={`${selectId}-label`}>
                        {options.length === 0 ? (
                            <li className={styles.emptyOption}>No options available</li>
                        ) : (
                            options.map((option) => (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={value === option.value}
                                    className={`${styles.option} ${
                                        value === option.value ? styles.optionSelected : ''
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>

            {error && (
                <span id={errorId} className={styles.error} role="alert">
                    {error}
                </span>
            )}
            {helperText && !error && (
                <span id={helperId} className={styles.helper}>
                    {helperText}
                </span>
            )}
        </div>
    );
}
