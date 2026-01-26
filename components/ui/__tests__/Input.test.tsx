import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
    it('renders label and input correctly', () => {
        render(<Input label="Email" type="email" />);
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    });

    it('displays error message when error prop is provided', () => {
        render(<Input label="Email" type="email" error="Invalid email" />);
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
        expect(screen.getByText('Invalid email')).toHaveAttribute('role', 'alert');
    });

    it('applies aria-invalid when error is present', () => {
        render(<Input label="Email" type="email" error="Invalid email" />);
        const input = screen.getByLabelText('Email');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input using aria-describedby', () => {
        render(<Input label="Email" type="email" error="Invalid email" />);
        const input = screen.getByLabelText('Email');
        const errorMessage = screen.getByText('Invalid email');
        expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    });

    it('associates helper text with input using aria-describedby', () => {
        render(<Input label="Password" type="password" helperText="At least 8 characters" />);
        const input = screen.getByLabelText('Password');
        const helperText = screen.getByText('At least 8 characters');
        expect(input).toHaveAttribute('aria-describedby', helperText.id);
    });

    it('does not apply aria-invalid when no error', () => {
        render(<Input label="Email" type="email" />);
        const input = screen.getByLabelText('Email');
        expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('shows required indicator when required prop is true', () => {
        render(<Input label="Email" type="email" required />);
        const label = screen.getByText('Email');
        expect(label.querySelector('.required')).toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
        const { container } = render(<Input label="Email" type="email" error="Invalid email" />);
        const input = container.querySelector('input');
        expect(input?.className).toContain('inputError');
    });
});
