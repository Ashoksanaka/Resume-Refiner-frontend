'use client';

import { useState, type ReactNode } from 'react';
import styles from './AdvancedFieldGroup.module.css';

interface AdvancedFieldGroupProps {
    title?: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function AdvancedFieldGroup({
    title = 'Advanced details',
    children,
    defaultOpen = false,
}: AdvancedFieldGroupProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.toggle}
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                {isOpen ? '−' : '+'} {title}
            </button>
            {isOpen && <div className={styles.content}>{children}</div>}
        </div>
    );
}
