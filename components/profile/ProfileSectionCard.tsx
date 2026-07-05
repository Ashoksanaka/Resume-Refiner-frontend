'use client';

import { ReactNode } from 'react';
import { Button, Card } from '@/components/ui';
import styles from './ProfileSectionCard.module.css';

interface ProfileSectionCardProps {
    id: string;
    title: string;
    isEditing: boolean;
    isSaving: boolean;
    saveSuccess?: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    children: ReactNode;
}

export function ProfileSectionCard({
    id,
    title,
    isEditing,
    isSaving,
    saveSuccess,
    onEdit,
    onSave,
    onCancel,
    children,
}: ProfileSectionCardProps) {
    return (
        <section id={id} className="scroll-mt-20">
            <Card className={styles.card}>
                <div className={styles.header}>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <div className={styles.actions}>
                        {saveSuccess && <span className={styles.success}>Saved</span>}
                        {isEditing ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isSaving}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Button onClick={onSave} isLoading={isSaving} size="sm">
                                    Save
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" onClick={onEdit} size="sm">
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
                <div className={styles.content}>{children}</div>
            </Card>
        </section>
    );
}

interface ProfileSectionFieldsetProps {
    isEditing: boolean;
    children: ReactNode;
    className?: string;
}

export function ProfileSectionFieldset({
    isEditing,
    children,
    className,
}: ProfileSectionFieldsetProps) {
    return (
        <fieldset disabled={!isEditing} className={`${styles.fieldset} ${className || ''}`}>
            {children}
        </fieldset>
    );
}
