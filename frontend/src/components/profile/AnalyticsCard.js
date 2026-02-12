import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, Eye, Star, Users, TrendingUp, Activity,
    PenSquare, BookOpen, Heart, BarChart3, X, ArrowLeft
} from 'lucide-react';

// ─── Mini sparkline component ───────────────────────────────────────────────
const Sparkline = ({ color = '#6366f1', seed = 1 }) => {
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

const formatNumber = (num) => {
    if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
};

const STAT_CONFIG = {
    projects: { gradient: 'from-blue-500/10 to-blue-600/5', glow: 'group-hover:shadow-blue-500/20', accent: '#3b82f6', ring: 'ring-blue-500/20' },
    blogPosts: { gradient: 'from-indigo-500/10 to-indigo-600/5', glow: 'group-hover:shadow-indigo-500/20', accent: '#6366f1', ring: 'ring-indigo-500/20' },
    views: { gradient: 'from-emerald-500/10 to-emerald-600/5', glow: 'group-hover:shadow-emerald-500/20', accent: '#10b981', ring: 'ring-emerald-500/20' },
    stars: { gradient: 'from-amber-500/10 to-amber-600/5', glow: 'group-hover:shadow-amber-500/20', accent: '#f59e0b', ring: 'ring-amber-500/20' },
    followers: { gradient: 'from-purple-500/10 to-purple-600/5', glow: 'group-hover:shadow-purple-500/20', accent: '#a855f7', ring: 'ring-purple-500/20', interactive: true },
    blogViews: { gradient: 'from-teal-500/10 to-teal-600/5', glow: 'group-hover:shadow-teal-500/20', accent: '#14b8a6', ring: 'ring-teal-500/20' },
    blogReactions: { gradient: 'from-pink-500/10 to-pink-600/5', glow: 'group-hover:shadow-pink-500/20', accent: '#ec4899', ring: 'ring-pink-500/20' },
    following: { gradient: 'from-cyan-500/10 to-cyan-600/5', glow: 'group-hover:shadow-cyan-500/20', accent: '#06b6d4', ring: 'ring-cyan-500/20', interactive: true },
    profileVisits: { gradient: 'from-orange-500/10 to-orange-600/5', glow: 'group-hover:shadow-orange-500/20', accent: '#f97316', ring: 'ring-orange-500/20' },
};

/**
 * UserListModal — Shows list of followers/following
 */
const UserListModal = ({ title, users, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Analytics</span>
                </button>
                <h3 className="text-lg font-heading font-semibold text-foreground">{title}</h3>
                <div className="w-4" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {users && users.length > 0 ? (
                    users.map((user, idx) => (
                        <Link
                            key={user.username || idx}
                            to={`/profile/${user.username}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group border border-transparent hover:border-border/50"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center font-bold text-accent">
                                {user.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                                    {user.full_name || user.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                        <Users className="w-12 h-12 mb-2" />
                        <p className="text-sm">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AnalyticsCard = ({ stats, isOwnProfile, followerList = [], followingList = [] }) => {
    const [animatedStats, setAnimatedStats] = useState({});
    const [hasAnimated, setHasAnimated] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'followers' | 'following'
    const containerRef = useRef(null);

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
            const eased = 1 - Math.pow(1 - progress, 4);
            const animated = {};
            Object.keys(stats).forEach(key => {
                animated[key] = Math.round((stats[key] || 0) * eased);
            });
            setAnimatedStats(animated);
            if (step >= steps) clearInterval(timer);
        }, interval);
    };

    // ─── Stat Sections ──────────────────────────────────────────────────────
    const sections = [
        {
            title: 'Project Performance',
            icon: Briefcase,
            items: [
                { key: 'projects', label: 'Projects', icon: Briefcase, color: 'text-blue-500' },
                { key: 'stars', label: 'Stars', icon: Star, color: 'text-amber-500' },
                { key: 'views', label: 'Total Views', icon: Eye, color: 'text-emerald-500' },
            ]
        },
        {
            title: 'Blog Insights',
            icon: PenSquare,
            items: [
                { key: 'blogPosts', label: 'Blog Posts', icon: PenSquare, color: 'text-indigo-500' },
                { key: 'blogViews', label: 'Blog Views', icon: BookOpen, color: 'text-teal-500' },
                { key: 'blogReactions', label: 'Blog Reactions', icon: Heart, color: 'text-pink-500' },
            ]
        },
        {
            title: 'Network & Impact',
            icon: Users,
            items: [
                { key: 'followers', label: 'Followers', icon: Users, color: 'text-purple-500' },
                { key: 'following', label: 'Following', icon: TrendingUp, color: 'text-cyan-500' },
                { key: 'profileVisits', label: 'Profile Visits', icon: Activity, color: 'text-orange-500' },
            ]
        }
    ];

    return (
        <div ref={containerRef} className="bg-card border border-border rounded-xl overflow-hidden mb-6 relative min-h-[400px]">
            {/* ── User List Overlay ── */}
            {activeSection && (
                <UserListModal
                    title={activeSection === 'followers' ? 'Followers' : 'Following'}
                    users={activeSection === 'followers' ? followerList : followingList}
                    onClose={() => setActiveSection(null)}
                />
            )}

            {/* ── Header ── */}
            <div className="relative px-6 pt-6 pb-4 border-b border-border/50">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center border border-accent/10">
                            <BarChart3 className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <div>
                            <h2 className="font-heading font-semibold text-lg text-foreground">
                                {isOwnProfile ? 'Your Analytics' : 'Developer Insights'}
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium opacity-60">
                                performance breakdown
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sections ── */}
            <div className="p-6 space-y-8">
                {sections.map((section, sIdx) => (
                    <div key={section.title} className="space-y-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-80">
                            <section.icon className="w-3.5 h-3.5" />
                            {section.title}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {section.items.map(({ key, label, icon: Icon, color }, index) => {
                                const config = STAT_CONFIG[key] || STAT_CONFIG.projects;
                                const isInteractive = config.interactive;
                                return (
                                    <div
                                        key={key}
                                        onClick={isInteractive ? () => setActiveSection(key) : undefined}
                                        className={`
                                            group relative overflow-hidden rounded-xl p-4
                                            bg-gradient-to-br ${config.gradient}
                                            border border-border/20 
                                            hover:border-border/50
                                            shadow-sm ${config.glow} hover:shadow-lg
                                            transition-all duration-300 ease-out
                                            ${isInteractive ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02]' : 'cursor-default'}
                                        `}
                                    >
                                        <div className="absolute bottom-0 right-0">
                                            <Sparkline color={config.accent} seed={sIdx * 3 + index + 1} />
                                        </div>

                                        <div className={`
                                            w-8 h-8 rounded-lg ring-1 ${config.ring}
                                            bg-background/80 backdrop-blur-sm
                                            flex items-center justify-center mb-3
                                            group-hover:scale-110 transition-transform duration-300
                                        `}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>

                                        <p className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1 relative z-10">
                                            {formatNumber(animatedStats[key] ?? 0)}
                                        </p>

                                        <div className="flex items-center justify-between relative z-10">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                {label}
                                            </p>
                                            {isInteractive && (
                                                <span className="text-[9px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View All
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsCard;
