'use client';

import styles from './Loading.module.css';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullPage?: boolean;
}

export function Loading({ size = 'md', text, fullPage = false }: LoadingProps) {
    const content = (
        <div className={styles.wrapper}>
            <div className={`${styles.spinner} ${styles[size]}`}>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
                <div className={styles.ring}></div>
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );

    if (fullPage) {
        return <div className={styles.fullPage}>{content}</div>;
    }

    return content;
}
