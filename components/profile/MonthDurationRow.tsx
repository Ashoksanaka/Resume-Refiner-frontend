'use client';

import { Input } from '@/components/ui';
import { dateToMonthValue, monthValueToApiDate } from '@/lib/validation/dates';
import styles from '@/app/(dashboard)/profile/page.module.css';

interface MonthDurationRowProps {
    startDate: string;
    endDate: string | null | undefined;
    onStartChange: (value: string) => void;
    onEndChange: (value: string | null) => void;
    ongoing: boolean;
    onOngoingChange: (ongoing: boolean) => void;
    ongoingLabel?: string;
    startError?: string;
    endError?: string;
    disabled?: boolean;
    startRequired?: boolean;
    endRequired?: boolean;
}

export function MonthDurationRow({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    ongoing,
    onOngoingChange,
    ongoingLabel = 'I am currently in this role',
    startError,
    endError,
    disabled = false,
    startRequired = true,
    endRequired = true,
}: MonthDurationRowProps) {
    return (
        <>
            <div className={styles.dateRow}>
                <Input
                    label="Start Date"
                    type="month"
                    value={dateToMonthValue(startDate)}
                    onChange={(e) => onStartChange(monthValueToApiDate(e.target.value))}
                    helperText="Month and year only"
                    required={startRequired}
                    error={startError}
                    disabled={disabled}
                />
                <Input
                    label="End Date"
                    type="month"
                    value={dateToMonthValue(endDate || '')}
                    onChange={(e) =>
                        onEndChange(e.target.value ? monthValueToApiDate(e.target.value) : '')
                    }
                    helperText="Month and year only"
                    disabled={disabled || ongoing}
                    required={endRequired && !ongoing}
                    error={endError}
                />
            </div>
            {!disabled && (
                <label className={styles.checkboxRow}>
                    <input
                        type="checkbox"
                        checked={ongoing}
                        onChange={(e) => onOngoingChange(e.target.checked)}
                    />
                    <span>{ongoingLabel}</span>
                </label>
            )}
        </>
    );
}

export function isOngoingEntry(endDate: string | null | undefined): boolean {
    return endDate === null;
}
