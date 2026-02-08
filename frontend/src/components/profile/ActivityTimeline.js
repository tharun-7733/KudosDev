import React from 'react';
import {
    Rocket, Edit3, Star, UserPlus, Award, GitBranch
} from 'lucide-react';

/**
 * ActivityTimeline - Chronological feed of user activities
 */
export const ActivityTimeline = ({ activities, isOwnProfile }) => {
    // Mock activities if none provided
    const defaultActivities = [
        { type: 'published', title: 'Published a new project', project: 'Portfolio Website', time: '2 hours ago' },
        { type: 'starred', title: 'Received 5 new stars', project: 'React Dashboard', time: '1 day ago' },
        { type: 'updated', title: 'Updated project documentation', project: 'API Toolkit', time: '3 days ago' },
        { type: 'follower', title: 'Gained a new follower', time: '5 days ago' },
    ];

    const activityList = activities?.length > 0 ? activities : (isOwnProfile ? defaultActivities : []);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'published': return { icon: Rocket, color: 'bg-green-500/10 text-green-500' };
            case 'updated': return { icon: Edit3, color: 'bg-blue-500/10 text-blue-500' };
            case 'starred': return { icon: Star, color: 'bg-yellow-500/10 text-yellow-500' };
            case 'follower': return { icon: UserPlus, color: 'bg-purple-500/10 text-purple-500' };
            case 'badge': return { icon: Award, color: 'bg-orange-500/10 text-orange-500' };
            default: return { icon: GitBranch, color: 'bg-muted text-muted-foreground' };
        }
    };

    if (activityList.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Recent Activity
                </h2>
                <p className="text-muted-foreground text-sm">
                    No recent activity to show.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                Recent Activity
            </h2>
            <div className="space-y-4">
                {activityList.map((activity, index) => {
                    const { icon: Icon, color } = getActivityIcon(activity.type);
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">
                                    {activity.title}
                                    {activity.project && (
                                        <span className="font-medium text-accent"> {activity.project}</span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {activity.time}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityTimeline;
