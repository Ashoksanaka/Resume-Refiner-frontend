'use client';

import styles from './Card.module.css';

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

export function Card({ title, subtitle, children, className }: CardProps) {
    return (
        <div className={`${styles.card} ${className || ''}`}>
            {(title || subtitle) && (
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            <div className={styles.content}>{children}</div>
        </div>
    );
}
