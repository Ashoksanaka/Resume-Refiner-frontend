'use client';

import styles from './Textarea.module.css';

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    helperText?: string;
    charCount?: boolean;
}

export function Textarea({
    label,
    error,
    helperText,
    charCount = false,
    id,
    maxLength,
    value,
    className,
    ...props
}: TextareaProps) {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
        <div className={`${styles.wrapper} ${className || ''}`}>
            <div className={styles.labelRow}>
                <label htmlFor={textareaId} className={styles.label}>
                    {label}
                    {props.required && <span className={styles.required}>*</span>}
                </label>
                {charCount && maxLength && (
                    <span className={styles.charCount}>
                        {currentLength}/{maxLength}
                    </span>
                )}
            </div>
            <textarea
                id={textareaId}
                className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                maxLength={maxLength}
                value={value}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
            {helperText && !error && (
                <span className={styles.helper}>{helperText}</span>
            )}
        </div>
    );
}
