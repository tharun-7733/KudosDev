import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FeatureCard } from '../components/FeatureCard';
import { Code2, Zap, Users } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="max-w-3xl">
                    <h1 className="font-heading font-bold text-5xl md:text-6xl tracking-tight text-foreground leading-tight mb-6">
                        Build Your Developer Credibility in Public
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Showcase your projects, track your progress, and gain recognition from the developer
                        community. A modern platform for developers who build in public.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/register"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-all inline-flex items-center gap-2"
                        >
                            Get Started
                            <span>→</span>
                        </Link>
                        <Link
                            to="/explore"
                            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-md font-medium transition-all"
                        >
                            Explore Projects
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-muted/30 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading font-bold text-3xl text-center text-foreground mb-16">
                        Why Developers Choose Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="group">
                            <FeatureCard
                                icon={Code2}
                                title="Showcase Projects"
                                description="Display your work with detailed project pages, tech stacks, and live demos"
                            />
                        </div>
                        <div className="group">
                            <FeatureCard
                                icon={Zap}
                                title="Track Progress"
                                description="Monitor your development journey and celebrate your achievements"
                            />
                        </div>
                        <div className="group">
                            <FeatureCard
                                icon={Users}
                                title="Join Community"
                                description="Connect with fellow developers and grow your professional network"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
