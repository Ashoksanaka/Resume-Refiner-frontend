import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSectionCard } from '@/components/profile/ProfileSectionCard';

describe('ProfileSectionCard', () => {
    it('shows Edit in view mode and Save/Cancel in edit mode', () => {
        const onEdit = jest.fn();
        const onSave = jest.fn();
        const onCancel = jest.fn();

        const { rerender } = render(
            <ProfileSectionCard
                id="summary"
                title="Professional Summary"
                isEditing={false}
                isSaving={false}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
            >
                <p>Section content</p>
            </ProfileSectionCard>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
        expect(onEdit).toHaveBeenCalled();

        rerender(
            <ProfileSectionCard
                id="summary"
                title="Professional Summary"
                isEditing
                isSaving={false}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
            >
                <p>Section content</p>
            </ProfileSectionCard>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onSave).toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalled();
    });
});
