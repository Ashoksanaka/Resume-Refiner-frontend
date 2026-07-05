import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '../app/(dashboard)/layout';

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/profile'),
}));

jest.mock('@/components/SideMenu', () => ({
    SideMenu: () => <aside data-testid="side-menu">SideMenu</aside>,
}));

jest.mock('@/components/TopBar', () => ({
    TopBar: () => <header data-testid="top-bar">TopBar</header>,
}));

jest.mock('../app/(dashboard)/layout.module.css', () => ({
    main: 'main-class',
}));

describe('Authenticated Layout (Dashboard)', () => {
    it('should render SideMenu and TopBar', () => {
        render(
            <DashboardLayout>
                <div data-testid="dashboard-content">Dashboard Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('side-menu')).toBeInTheDocument();
        expect(screen.getByTestId('top-bar')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });
});
