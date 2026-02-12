import React, { useEffect, useState, useRef } from 'react';
import {
    Briefcase, Eye, Star, Users, TrendingUp, Activity,
    PenSquare, BookOpen, Heart, BarChart3, Sparkles
} from 'lucide-react';

// ─── Mini sparkline component ───────────────────────────────────────────────
const Sparkline = ({ color = '#6366f1', seed = 1 }) => {
    // Generate deterministic pseudo-random sparkline points
    const points = [];
    let v = 30 + (seed * 7) % 20;
    for (let i = 0; i < 7; i++) {
        v = Math.max(10, Math.min(50, v + ((seed * (i + 1) * 13) % 21) - 10));
        points.push(v);
    }
    const max = 55;
    const w = 80, h = 32;
    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * w} ${h - (p / max) * h}`)
        .join(' ');
    const areaData = pathData + ` L ${w} ${h} L 0 ${h} Z`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-40 group-hover:opacity-70 transition-opacity duration-500">
            <defs>
                <linearGradient id={`grad-${seed}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaData} fill={`url(#grad-${seed})`} />
            <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// ─── Format large numbers ───────────────────────────────────────────────────
const formatNumber = (num) => {
    if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
};

// ─── Stat card configs with gradients ───────────────────────────────────────
const STAT_CONFIG = {
    projects: { gradient: 'from-blue-500/10 to-blue-600/5', glow: 'group-hover:shadow-blue-500/20', accent: '#3b82f6', ring: 'ring-blue-500/20' },
    blogPosts: { gradient: 'from-indigo-500/10 to-indigo-600/5', glow: 'group-hover:shadow-indigo-500/20', accent: '#6366f1', ring: 'ring-indigo-500/20' },
    views: { gradient: 'from-emerald-500/10 to-emerald-600/5', glow: 'group-hover:shadow-emerald-500/20', accent: '#10b981', ring: 'ring-emerald-500/20' },
    stars: { gradient: 'from-amber-500/10 to-amber-600/5', glow: 'group-hover:shadow-amber-500/20', accent: '#f59e0b', ring: 'ring-amber-500/20' },
    followers: { gradient: 'from-purple-500/10 to-purple-600/5', glow: 'group-hover:shadow-purple-500/20', accent: '#a855f7', ring: 'ring-purple-500/20' },
    blogViews: { gradient: 'from-teal-500/10 to-teal-600/5', glow: 'group-hover:shadow-teal-500/20', accent: '#14b8a6', ring: 'ring-teal-500/20' },
    blogReactions: { gradient: 'from-pink-500/10 to-pink-600/5', glow: 'group-hover:shadow-pink-500/20', accent: '#ec4899', ring: 'ring-pink-500/20' },
    following: { gradient: 'from-cyan-500/10 to-cyan-600/5', glow: 'group-hover:shadow-cyan-500/20', accent: '#06b6d4', ring: 'ring-cyan-500/20' },
    profileVisits: { gradient: 'from-orange-500/10 to-orange-600/5', glow: 'group-hover:shadow-orange-500/20', accent: '#f97316', ring: 'ring-orange-500/20' },
};

/**
 * AnalyticsCard — Premium analytics dashboard with animated counters,
 * sparkline graphs, gradient cards, and hover micro-interactions.
 */
export const AnalyticsCard = ({ stats, isOwnProfile }) => {
    const [animatedStats, setAnimatedStats] = useState({});
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef(null);

    // Intersection Observer — only animate when visible
    useEffect(() => {
        if (!stats || hasAnimated) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [stats, hasAnimated]);

    const startAnimation = () => {
        if (!stats) return;
        setHasAnimated(true);

        const duration = 1400;
        const steps = 45;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            // Smooth ease-out quart
            const eased = 1 - Math.pow(1 - progress, 4);

            const animated = {};
            Object.keys(stats).forEach(key => {
                animated[key] = Math.round((stats[key] || 0) * eased);
            });
            setAnimatedStats(animated);

            if (step >= steps) clearInterval(timer);
        }, interval);
    };

    // ─── Build stat items ───────────────────────────────────────────────────
    const statItems = [
        { key: 'projects', label: 'Projects', icon: Briefcase, color: 'text-blue-500' },
        { key: 'blogPosts', label: 'Blog Posts', icon: PenSquare, color: 'text-indigo-500' },
        { key: 'views', label: 'Total Views', icon: Eye, color: 'text-emerald-500' },
        { key: 'stars', label: 'Stars', icon: Star, color: 'text-amber-500' },
        { key: 'followers', label: 'Followers', icon: Users, color: 'text-purple-500' },
    ];

    if (isOwnProfile) {
        statItems.push(
            { key: 'blogViews', label: 'Blog Views', icon: BookOpen, color: 'text-teal-500' },
            { key: 'blogReactions', label: 'Blog Reactions', icon: Heart, color: 'text-pink-500' },
            { key: 'following', label: 'Following', icon: TrendingUp, color: 'text-cyan-500' },
            { key: 'profileVisits', label: 'Profile Visits', icon: Activity, color: 'text-orange-500' }
        );
    }

    // ─── Compute totals for summary bar ─────────────────────────────────────
    const totalEngagement = (stats?.views || 0) + (stats?.blogViews || 0) + (stats?.stars || 0) + (stats?.blogReactions || 0);
    const totalContent = (stats?.projects || 0) + (stats?.blogPosts || 0);

    return (
        <div ref={containerRef} className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            {/* ── Header with gradient accent ── */}
            <div className="relative px-6 pt-6 pb-4">
                {/* Subtle gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                            <BarChart3 className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <div>
                            <h2 className="font-heading font-semibold text-lg text-foreground">
                                {isOwnProfile ? 'Your Analytics' : 'Developer Insights'}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {totalContent} content pieces · {formatNumber(totalEngagement)} total engagement
                            </p>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                            <Sparkles className="w-3 h-3" /> Live
                        </span>
                    )}
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {statItems.map(({ key, label, icon: Icon, color }, index) => {
                        const config = STAT_CONFIG[key] || STAT_CONFIG.projects;
                        return (
                            <div
                                key={key}
                                className={`
                                    group relative overflow-hidden rounded-xl p-4
                                    bg-gradient-to-br ${config.gradient}
                                    border border-transparent hover:border-border/50
                                    shadow-sm ${config.glow} hover:shadow-lg
                                    transition-all duration-300 ease-out
                                    hover:-translate-y-0.5 hover:scale-[1.02]
                                    cursor-default
                                `}
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                {/* Sparkline background */}
                                <div className="absolute bottom-0 right-0">
                                    <Sparkline color={config.accent} seed={index + 1} />
                                </div>

                                {/* Icon with ring */}
                                <div className={`
                                    w-8 h-8 rounded-lg ring-1 ${config.ring}
                                    bg-background/80 backdrop-blur-sm
                                    flex items-center justify-center mb-3
                                    group-hover:scale-110 transition-transform duration-300
                                `}>
                                    <Icon className={`w-4 h-4 ${color}`} />
                                </div>

                                {/* Number */}
                                <p className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1 relative z-10">
                                    {formatNumber(animatedStats[key] ?? 0)}
                                </p>

                                {/* Label */}
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider relative z-10">
                                    {label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
