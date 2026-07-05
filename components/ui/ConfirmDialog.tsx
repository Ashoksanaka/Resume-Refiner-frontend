'use client';

import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div className={styles.backdrop} role="presentation" onClick={onCancel}>
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="confirm-dialog-title" className={styles.title}>
                    {title}
                </h3>
                <p id="confirm-dialog-message" className={styles.message}>
                    {message}
                </p>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
}
