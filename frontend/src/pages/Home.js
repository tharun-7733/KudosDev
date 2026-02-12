import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FeatureCard } from '../components/FeatureCard';
import { useAuth } from '../context/AuthContext';
import { Code2, Zap, Users, PenSquare, ArrowRight } from 'lucide-react';

export default function Home() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="max-w-3xl">
                    <h1 className="font-heading font-bold text-5xl md:text-6xl tracking-tight text-foreground leading-tight mb-6">
                        {isAuthenticated
                            ? `Welcome back, ${user?.full_name?.split(' ')[0] || 'Developer'}!`
                            : 'Build Your Developer Credibility in Public'}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {isAuthenticated
                            ? 'Ready to continue building? Head to your dashboard to manage your projects or explore what others are creating.'
                            : 'Showcase your projects, track your progress, and gain recognition from the developer community. A modern platform for developers who build in public.'}
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/register'}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-all inline-flex items-center gap-2"
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
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

            {/* Blog Writing Section */}
            <section className="py-20 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-widest text-accent mb-3 block">Developer Blog</span>
                            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight text-foreground mb-4">
                                Write what's on your mind
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                A beautiful writing experience built for developers. Write dev logs, tutorials, and opinions with live markdown preview, syntax highlighting, and one-click publishing.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {['Live Preview', 'Syntax Highlighting', 'Auto-Save', 'Social Sharing', 'Reactions'].map(f => (
                                    <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium">
                                        {f}
                                    </span>
                                ))}
                            </div>
                            <Link
                                to={isAuthenticated ? '/blog/new' : '/register'}
                                className="inline-flex items-center gap-2 text-accent font-medium hover:underline transition-all"
                            >
                                {isAuthenticated ? 'Start Writing' : 'Get Started'}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                <span className="ml-2 text-xs text-muted-foreground font-mono">blog-editor.md</span>
                            </div>
                            <div className="font-mono text-sm space-y-1.5 text-muted-foreground">
                                <p><span className="text-accent"># </span><span className="text-foreground font-medium">Building a REST API with FastAPI</span></p>
                                <p className="text-muted-foreground/60">---</p>
                                <p>Today I learned how to build a <span className="text-yellow-500">**blazing fast**</span> API</p>
                                <p>using <span className="text-accent">FastAPI</span> and <span className="text-accent">MongoDB</span>.</p>
                                <p className="mt-2"><span className="text-green-500">```python</span></p>
                                <p className="text-foreground">@app.get("/api/blogs")</p>
                                <p className="text-foreground">async def get_blogs():</p>
                                <p className="text-foreground">    return await db.blogs.find()</p>
                                <p><span className="text-green-500">```</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-muted/30 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading font-bold text-3xl text-center text-foreground mb-16">
                        Why Developers Choose Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group">
                            <FeatureCard
                                icon={Code2}
                                title="Showcase Projects"
                                description="Display your work with detailed project pages, tech stacks, and live demos"
                            />
                        </div>
                        <div className="group">
                            <FeatureCard
                                icon={PenSquare}
                                title="Developer Blog"
                                description="Write tutorials, dev logs, and opinions with markdown, reactions, and social sharing"
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
