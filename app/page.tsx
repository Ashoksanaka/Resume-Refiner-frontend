'use client';

import { ArrowRight, CheckCircle, Zap, Shield, Brain, FileText } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const Page = () => {
    const [email, setEmail] = useState('');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-accent">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold tracking-tight">ResumeTailor</div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Signup
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6 text-balance">
                        Your resume, tailored precisely for the job
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        Customize your resume for any job in seconds. Uses your actual experience, never invents credentials. ATS-optimized, ready to submit.
                    </p>

                    <div className="flex justify-center mb-16">
                        <Link
                            href="/signup"
                            className="relative px-8 py-3 bg-background text-white font-semibold rounded-full border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_20px_10px_rgba(168,85,247,0.6)] active:scale-95 active:shadow-[0_0_10px_5px_rgba(168,85,247,0.4)] group flex items-center justify-center gap-2"
                        >
                            <span className="flex items-center gap-2">
                                <span>Create My Resume</span>
                                <ArrowRight size={18} className="text-purple-500 group-hover:text-white transition-colors duration-300" />
                            </span>
                            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/20 to-indigo-500/20" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-20 px-6 bg-muted">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">Why Standard Resumes Fail</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="w-full h-auto bg-gradient-to-br from-[#00ff75] to-[#3700ff] rounded-[20px] p-[2px] transition-all duration-300 hover:shadow-[0px_0px_30px_1px_rgba(0,255,117,0.30)] group">
                            <div className="w-full h-full bg-[#1a1a1a] rounded-[18px] p-8 transition-all duration-200 group-hover:scale-[0.98] group-hover:rounded-[20px]">
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <FileText className="text-primary" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-white">Generic Content</h3>
                                <p className="text-muted-foreground">
                                    One resume for every job means you're missing critical keywords the hiring manager's ATS system is looking for.
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-auto bg-gradient-to-br from-[#00ff75] to-[#3700ff] rounded-[20px] p-[2px] transition-all duration-300 hover:shadow-[0px_0px_30px_1px_rgba(0,255,117,0.30)] group">
                            <div className="w-full h-full bg-[#1a1a1a] rounded-[18px] p-8 transition-all duration-200 group-hover:scale-[0.98] group-hover:rounded-[20px]">
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="text-primary" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-white">ATS Rejection</h3>
                                <p className="text-muted-foreground">
                                    Applicant Tracking Systems filter out 75% of resumes before a human ever sees them. Formatting matters.
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-auto bg-gradient-to-br from-[#00ff75] to-[#3700ff] rounded-[20px] p-[2px] transition-all duration-300 hover:shadow-[0px_0px_30px_1px_rgba(0,255,117,0.30)] group">
                            <div className="w-full h-full bg-[#1a1a1a] rounded-[18px] p-8 transition-all duration-200 group-hover:scale-[0.98] group-hover:rounded-[20px]">
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <Brain className="text-primary" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-white">AI Hallucinations</h3>
                                <p className="text-muted-foreground">
                                    Many AI tools invent skills and experience that don't exist. We never do that. What you have is what we use.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-16 text-center">How It Works</h2>

                    <div className="space-y-8">
                        <div className="flex gap-8 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                                    1
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Build Your Profile</h3>
                                <p className="text-muted-foreground text-lg">
                                    Input your LinkedIn-style profile with your actual experience, skills, education, and accomplishments. This is your data foundation.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-8 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                                    2
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Paste the Job Description</h3>
                                <p className="text-muted-foreground text-lg">
                                    Copy and paste the job posting. Our AI analyzes the requirements, culture, and key responsibilities instantly.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-8 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                                    3
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">Get Your Tailored Resume</h3>
                                <p className="text-muted-foreground text-lg">
                                    We reorder, reframe, and highlight the exact parts of your experience that matter most for this job. ATS-friendly LaTeX formatting included.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Differentiators */}
            <section className="py-20 px-6 bg-muted">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">Why ResumeTailor Is Different</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                            <CheckCircle className="text-primary flex-shrink-0" size={24} />
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Zero Hallucinations</h3>
                                <p className="text-muted-foreground">
                                    Every detail comes from your profile. We never invent credentials, skills, or experience.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <CheckCircle className="text-primary flex-shrink-0" size={24} />
                            <div>
                                <h3 className="text-lg font-semibold mb-1">ATS-Optimized</h3>
                                <p className="text-muted-foreground">
                                    Clean LaTeX formatting, no tricks. Passes every applicant tracking system.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <CheckCircle className="text-primary flex-shrink-0" size={24} />
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Transparent Edits</h3>
                                <p className="text-muted-foreground">
                                    See exactly what changed. Approve or adjust before you download.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <CheckCircle className="text-primary flex-shrink-0" size={24} />
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Profile-Driven</h3>
                                <p className="text-muted-foreground">
                                    Build once, customize endlessly. Reuse your profile for unlimited tailored versions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust / Credibility */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-accent/5 border border-accent rounded-2xl p-12">
                        <div className="flex gap-4 mb-6">
                            <Shield className="text-primary flex-shrink-0" size={32} />
                        </div>

                        <h2 className="text-3xl font-bold mb-6">Built on Trust & Precision</h2>

                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            We know AI can be unreliable. That's why ResumeTailor works differently. Every change is grounded in your actual experience. Our system never guesses, invents, or exaggerates. Your resume reflects who you really are—just optimized for the specific job you're applying to.
                        </p>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Your data stays private. We don't train AI models on your resume. We don't share your profile. We don't contact recruiters. We're here to help you present your authentic self, better.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section id="cta" className="py-20 px-6 bg-primary text-primary-foreground">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Your Next Job?</h2>
                    <p className="text-xl mb-10 opacity-90">
                        Get a tailored, ATS-friendly resume in minutes. No credits. No signup fee. No BS.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-6 py-3 rounded-full bg-primary-foreground text-foreground placeholder:text-muted-foreground flex-1 sm:flex-none sm:min-w-80 focus:outline-none"
                        />
                        <Link href="/signup" className="px-8 py-3 bg-background text-primary font-semibold rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                    </div>

                    <p className="text-sm opacity-75">
                        No credit card required. Start customizing in 60 seconds.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Page;
