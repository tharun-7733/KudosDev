import React from 'react';
import {
    FileText, Github, Linkedin, Globe, Upload, Download, ExternalLink
} from 'lucide-react';

/**
 * ResumeSection - Resume upload/preview and external links
 */
export const ResumeSection = ({ user, isOwnProfile }) => {
    const externalLinks = [
        { key: 'github_url', label: 'GitHub', icon: Github, color: 'hover:text-gray-900 dark:hover:text-white' },
        { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, color: 'hover:text-blue-600' },
        { key: 'website_url', label: 'Portfolio', icon: Globe, color: 'hover:text-accent' },
    ];

    const hasLinks = externalLinks.some(link => user?.[link.key]);
    const hasResume = user?.resume_url;

    if (!hasLinks && !hasResume && !isOwnProfile) {
        return null; // Don't show section if empty for public view
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                Resume & Links
            </h2>

            {/* Resume Section */}
            <div className="mb-6">
                {hasResume ? (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-accent" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Resume.pdf</p>
                                <p className="text-xs text-muted-foreground">Last updated recently</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={user.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        </div>
                    </div>
                ) : isOwnProfile ? (
                    <button className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">Upload Resume (PDF)</span>
                    </button>
                ) : (
                    <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                )}
            </div>

            {/* External Links */}
            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">External Links</h3>
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

export default ResumeSection;
