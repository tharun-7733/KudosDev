import React from 'react';
import { Edit2, Share2, MapPin, Calendar, ExternalLink } from 'lucide-react';

/**
 * ProfileHeader - Displays user avatar, name, bio, and action buttons
 * Renders differently for own profile vs public profile
 */
export const ProfileHeader = ({ user, isOwnProfile, onFollow, isFollowing }) => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {user?.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-border"
                        />
                    ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-3xl font-bold border-4 border-border">
                            {getInitials(user?.full_name)}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                                {user?.full_name || 'Developer'}
                            </h1>
                            <p className="text-muted-foreground">
                                @{user?.username}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {isOwnProfile ? (
                                <>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-colors">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onFollow}
                                        className={`
                                            inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
                                            ${isFollowing
                                                ? 'border border-border bg-card hover:bg-muted text-foreground'
                                                : 'bg-accent text-accent-foreground hover:bg-accent/90'}
                                        `}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {user?.bio && (
                        <p className="mt-3 text-foreground max-w-2xl">
                            {user.bio}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {user?.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {user.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined {formatDate(user?.created_at)}
                        </span>
                        {user?.website_url && (
                            <a
                                href={user.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-accent hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Website
                            </a>
                        )}
                    </div>

                    {/* Role Tags / Skills Preview */}
                    {user?.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {user.skills.slice(0, 5).map(skill => (
                                <span
                                    key={skill}
                                    className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                            {user.skills.length > 5 && (
                                <span className="text-xs text-muted-foreground">
                                    +{user.skills.length - 5} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
