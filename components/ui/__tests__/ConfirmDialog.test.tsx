import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
    it('calls confirm and cancel handlers', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();

        render(
            <ConfirmDialog
                open
                title="Remove experience?"
                message="Are you sure?"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onConfirm).toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalled();
    });
});
