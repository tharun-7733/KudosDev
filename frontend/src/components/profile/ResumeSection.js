import React from 'react';
import {
    Github, Linkedin, Globe, ExternalLink
} from 'lucide-react';

/**
 * SocialsSection - Displays social media links (formerly ResumeSection)
 */
export const SocialsSection = ({ user, isOwnProfile }) => {
    const externalLinks = [
        { key: 'github_url', label: 'GitHub', icon: Github, color: 'hover:text-gray-900 dark:hover:text-white' },
        { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, color: 'hover:text-blue-600' },
        { key: 'website_url', label: 'Portfolio', icon: Globe, color: 'hover:text-accent' },
    ];

    const hasLinks = externalLinks.some(link => user?.[link.key]);

    if (!hasLinks && !isOwnProfile) {
        return null; // Don't show section if empty for public view
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                Socials
            </h2>

            {/* External Links */}
            <div>
                <div className="flex flex-wrap gap-3">
                    {externalLinks.map(({ key, label, icon: Icon, color }) => {
                        const url = user?.[key];
                        if (!url && !isOwnProfile) return null;

                        return url ? (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground ${color} transition-colors`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{label}</span>
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                        ) : isOwnProfile ? (
                            <button
                                key={key}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">Add {label}</span>
                            </button>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
};

export default SocialsSection;
