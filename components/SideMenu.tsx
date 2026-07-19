'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isEducationSectionComplete } from '@/lib/validation/education';
import {
    isAchievementComplete,
    isLanguageComplete,
    isPatentComplete,
    isProjectComplete,
    isPublicationComplete,
    migrateProfile,
    validateStringTags,
} from '@/lib/validation/profileSections';
import {
    User,
    Briefcase,
    GraduationCap,
    Folder,
    Trophy,
    BookOpen,
    Award,
    BadgeCheck,
    Heart,
    Languages,
    Smile,
    FilePlus,
    Menu,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Zap,
    FileCheck,
    ShieldCheck,
    Users,
    ClipboardList,
    Compass,
    Layout,
    Coffee,
    Stamp,
    LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { profileApi, ApiClientError } from '@/services/apiClient';
import { Profile } from '@/types/api';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    sectionId?: string;
    badge?: boolean;
}

const SIDEBAR_WIDTH = 'w-64';
const SIDEBAR_WIDTH_COLLAPSED = 'w-[72px]';

export const SideMenu: React.FC = () => {
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeSection, setActiveSection] = useState<string>('');
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileApi.get();
                setProfile(migrateProfile(data));
            } catch (err) {
                // 404 is expected until the user creates a profile
                if (!(err instanceof ApiClientError && err.status === 404)) {
                    console.error('Failed to fetch profile for badges:', err);
                }
            }
        };
        if (isLoaded && isSignedIn) {
            fetchProfile();
        }
    }, [isLoaded, isSignedIn]);

    // Intersection Observer for Active Section Highlighting
    useEffect(() => {
        if (pathname !== '/profile') {
            setActiveSection('');
            return;
        }

        const sections = [
            'personal', 'summary', 'experience', 'education', 'skills',
            'projects', 'achievements', 'publications', 'patents',
            'licenses', 'trainings', 'volunteering', 'organizations',
            'positions', 'career_breaks', 'languages', 'test_scores',
            'areas_of_interest', 'hobbies'
        ];

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            if (isScrolling) return;

            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            if (visibleEntries.length > 0) {
                // Pick the one closest to the top
                const topVisible = visibleEntries.reduce((prev, curr) =>
                    curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
                );
                setActiveSection(topVisible.target.id);
            }
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [pathname, isScrolling]);

    // Handle smooth scroll and manual active setting
    const scrollToSection = (sectionId: string) => {
        setIsScrolling(true);
        setActiveSection(sectionId);

        const el = document.getElementById(sectionId);
        if (el) {
            const offset = 80; // height of sticky header or padding
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Focus management
            const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus({ preventScroll: true }), 500);
            }
        }

        setTimeout(() => setIsScrolling(false), 1000);
        setIsMobileMenuOpen(false);
    };

    const isSectionIncomplete = (section: string): boolean => {
        if (!profile) return false;

        switch (section) {
            case 'personal':
                return !profile.personalInfo.full_name || !profile.personalInfo.email;
            case 'summary':
                return !profile.summary || profile.summary.length < 10;
            case 'experience':
                return !profile.experience || profile.experience.length === 0;
            case 'education':
                return !isEducationSectionComplete(profile.education || []);
            case 'skills':
                return !profile.skills || profile.skills.length === 0;
            case 'projects':
                return (
                    !profile.projects?.length ||
                    !profile.projects.every(isProjectComplete)
                );
            case 'achievements':
                return (
                    !profile.achievements?.length ||
                    !profile.achievements.every(isAchievementComplete)
                );
            case 'publications':
                return (
                    !profile.publications?.length ||
                    !profile.publications.every(isPublicationComplete)
                );
            case 'patents':
                return (
                    !profile.patents?.length ||
                    !profile.patents.every(isPatentComplete)
                );
            case 'licenses':
                return !profile.licenses || profile.licenses.length === 0;
            case 'trainings':
                return !profile.trainings || profile.trainings.length === 0;
            case 'volunteering':
                return !profile.volunteering || profile.volunteering.length === 0;
            case 'organizations':
                return !profile.organizations || profile.organizations.length === 0;
            case 'positions':
                return !profile.positions || profile.positions.length === 0;
            case 'career_breaks':
                return !profile.career_breaks || profile.career_breaks.length === 0;
            case 'languages':
                return (
                    !profile.languages?.length ||
                    !profile.languages.every(isLanguageComplete)
                );
            case 'test_scores':
                return !profile.test_scores || profile.test_scores.length === 0;
            case 'areas_of_interest':
                return Boolean(
                    validateStringTags(profile.areas_of_interest || [], 'Areas of interest')
                );
            case 'hobbies':
                return Boolean(validateStringTags(profile.hobbies || [], 'Hobbies'));
            default:
                return false;
        }
    };

    const profileItems: NavItem[] = [
        { label: 'Overview', icon: User, href: '/profile#personal', sectionId: 'personal', badge: isSectionIncomplete('personal') },
        { label: 'Experience', icon: Briefcase, href: '/profile#experience', sectionId: 'experience', badge: isSectionIncomplete('experience') },
        { label: 'Education', icon: GraduationCap, href: '/profile#education', sectionId: 'education', badge: isSectionIncomplete('education') },
        { label: 'Skills', icon: Zap, href: '/profile#skills', sectionId: 'skills', badge: isSectionIncomplete('skills') },
        { label: 'Projects', icon: Folder, href: '/profile#projects', sectionId: 'projects', badge: isSectionIncomplete('projects') },
        { label: 'Achievements', icon: Trophy, href: '/profile#achievements', sectionId: 'achievements', badge: isSectionIncomplete('achievements') },
        { label: 'Publications', icon: BookOpen, href: '/profile#publications', sectionId: 'publications', badge: isSectionIncomplete('publications') },
        { label: 'Patents', icon: Award, href: '/profile#patents', sectionId: 'patents', badge: isSectionIncomplete('patents') },
        { label: 'Licenses', icon: FileCheck, href: '/profile#licenses', sectionId: 'licenses', badge: isSectionIncomplete('licenses') },
        { label: 'Trainings', icon: ShieldCheck, href: '/profile#trainings', sectionId: 'trainings', badge: isSectionIncomplete('trainings') },
        { label: 'Volunteering', icon: Heart, href: '/profile#volunteering', sectionId: 'volunteering', badge: isSectionIncomplete('volunteering') },
        { label: 'Organizations', icon: Users, href: '/profile#organizations', sectionId: 'organizations', badge: isSectionIncomplete('organizations') },
        { label: 'Positions', icon: Stamp, href: '/profile#positions', sectionId: 'positions', badge: isSectionIncomplete('positions') },
        { label: 'Career Breaks', icon: Coffee, href: '/profile#career_breaks', sectionId: 'career_breaks', badge: isSectionIncomplete('career_breaks') },
        { label: 'Languages', icon: Languages, href: '/profile#languages', sectionId: 'languages', badge: isSectionIncomplete('languages') },
        { label: 'Test Scores', icon: ClipboardList, href: '/profile#test_scores', sectionId: 'test_scores', badge: isSectionIncomplete('test_scores') },
        { label: 'Areas of Interest', icon: Compass, href: '/profile#areas_of_interest', sectionId: 'areas_of_interest', badge: isSectionIncomplete('areas_of_interest') },
        { label: 'Hobbies', icon: Smile, href: '/profile#hobbies', sectionId: 'hobbies', badge: isSectionIncomplete('hobbies') },
    ];

    const resumeItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Generate Resume', icon: FilePlus, href: '/generate' },
    ];

    const NavLink = ({ item, isSubItem = false }: { item: NavItem, isSubItem?: boolean }) => {
        const isActive = activeSection === item.sectionId ||
            (pathname === item.href.split('#')[0] && !item.sectionId);

        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group relative
          ${isActive ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}
          ${isCollapsed && !isMobileMenuOpen ? 'justify-center px-0' : ''}
          ${isSubItem ? 'ml-4 py-1.5' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                role="menuitem"
                onClick={(e) => {
                    if (item.sectionId && pathname === '/profile') {
                        e.preventDefault();
                        scrollToSection(item.sectionId);
                        window.history.pushState(null, '', `#${item.sectionId}`);
                    } else {
                        setIsMobileMenuOpen(false);
                    }
                }}
            >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}

                {item.badge && (
                    <span
                        className={`absolute top-1 right-2 w-1.5 h-1.5 bg-destructive rounded-full border border-background shadow-red-500/50 shadow-sm
              ${isCollapsed ? 'right-2' : ''}`}
                    />
                )}

                {(isCollapsed && !isMobileMenuOpen) && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-[10px] font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-[100] border border-border">
                        {item.label}
                    </div>
                )}

                {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-1/2 bg-primary-foreground/30 rounded-r-full" />
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center px-4 z-40">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 hover:bg-accent rounded-md"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="ml-4 font-bold text-lg">Resume AI</span>
            </div>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-card border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-full md:w-64' : '-translate-x-full lg:translate-x-0'}
          ${!isMobileMenuOpen && (isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH)}
        `}
                aria-expanded={!isCollapsed}
            >
                <div
                    className={`h-16 flex items-center justify-between border-b border-border ${
                        isCollapsed && !isMobileMenuOpen ? 'px-2' : 'px-6'
                    }`}
                    onClick={(e) => {
                        // Prevent clicks on the header div itself (not on links or buttons) from triggering any actions
                        const target = e.target as HTMLElement;
                        const isClickOnLink = target.closest('a');
                        const isClickOnButton = target.closest('button');

                        // Only stop propagation if clicking on the div itself or non-interactive children
                        if (!isClickOnLink && !isClickOnButton) {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }
                    }}
                    style={{ pointerEvents: 'auto' }}
                >
                    <Link
                        href="/"
                        className={`flex items-center font-bold text-primary ${
                            isCollapsed && !isMobileMenuOpen
                                ? 'flex-col text-[10px] leading-tight text-center w-full'
                                : 'gap-2 text-xl'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isCollapsed && !isMobileMenuOpen ? (
                            <>
                                <span>Resume</span>
                                <span>AI</span>
                            </>
                        ) : (
                            <span>Resume AI</span>
                        )}
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(false);
                        }}
                        className="lg:hidden p-2 hover:bg-accent rounded-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCollapsed(!isCollapsed);
                        }}
                        className="hidden lg:flex p-1.5 hover:bg-accent rounded-md text-muted-foreground"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                <nav
                    className="flex-1 overflow-y-auto pt-4 pb-4 px-3 space-y-4 no-scrollbar"
                    role="menu"
                >
                    {/* Profile Group */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors
                                ${isCollapsed ? 'justify-center px-0' : ''}`}
                            aria-expanded={isProfileExpanded}
                            aria-controls="profile-submenu"
                        >
                            {isCollapsed ? <User className="w-4 h-4" /> : <span>Profile</span>}
                            {!isCollapsed && (
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileExpanded ? '' : '-rotate-90'}`} />
                            )}
                        </button>
                        {(isProfileExpanded || isCollapsed) && (
                            <div
                                id="profile-submenu"
                                className={`space-y-0.5 mt-1 transition-all duration-300 overflow-hidden ${!isProfileExpanded && !isCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}
                            >
                                {profileItems.map((item) => (
                                    <NavLink key={item.label} item={item} isSubItem={!isCollapsed} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resume Group */}
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Resume
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {resumeItems.map((item) => (
                                <NavLink key={item.label} item={item} />
                            ))}
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content Spacer for Desktop */}
            <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}`} />
        </>
    );
};
