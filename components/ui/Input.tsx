'use client';

import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    id,
    className,
    ...props
}: InputProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`${styles.wrapper} ${className || ''}`}>
            <label htmlFor={inputId} className={styles.label}>
                {label}
                {props.required && <span className={styles.required}>*</span>}
            </label>
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                {...props}
            />
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
