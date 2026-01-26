'use client';

import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    children,
    disabled,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''
                } ${className || ''}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className={styles.loader}>
                    <span className={styles.spinner}></span>
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
