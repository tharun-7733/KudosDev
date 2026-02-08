import React, { useEffect, useState } from 'react';
import {
    Briefcase, Eye, Star, Users, TrendingUp, Activity
} from 'lucide-react';

/**
 * AnalyticsCard - Displays user's personal analytics with animated counters
 */
export const AnalyticsCard = ({ stats, isOwnProfile }) => {
    const [animatedStats, setAnimatedStats] = useState({});

    // Animate counters on mount
    useEffect(() => {
        if (!stats) return;

        const duration = 1000;
        const steps = 30;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

            setAnimatedStats({
                projects: Math.round((stats.projects || 0) * eased),
                views: Math.round((stats.views || 0) * eased),
                stars: Math.round((stats.stars || 0) * eased),
                followers: Math.round((stats.followers || 0) * eased),
                following: Math.round((stats.following || 0) * eased),
                profileVisits: Math.round((stats.profileVisits || 0) * eased),
            });

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, [stats]);

    const statItems = [
        { key: 'projects', label: 'Projects', icon: Briefcase, color: 'text-blue-500' },
        { key: 'views', label: 'Total Views', icon: Eye, color: 'text-green-500' },
        { key: 'stars', label: 'Stars', icon: Star, color: 'text-yellow-500' },
        { key: 'followers', label: 'Followers', icon: Users, color: 'text-purple-500' },
    ];

    // Add extra stats for own profile
    if (isOwnProfile) {
        statItems.push(
            { key: 'following', label: 'Following', icon: TrendingUp, color: 'text-cyan-500' },
            { key: 'profileVisits', label: 'Profile Visits', icon: Activity, color: 'text-orange-500' }
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                {isOwnProfile ? 'Your Analytics' : 'Developer Insights'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {statItems.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                        <p className="text-2xl font-bold text-foreground">
                            {animatedStats[key] ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsCard;
