import React from 'react';
import { Trash2, Edit2, Calendar } from 'lucide-react';

/**
 * VersionEntry - Changelog item component for version history
 */
export const VersionEntry = ({
    version,
    description,
    date,
    onEdit,
    onDelete,
    isLatest = false
}) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`
            relative pl-6 pb-4
            border-l-2 
            ${isLatest ? 'border-accent' : 'border-border'}
        `}>
            {/* Dot */}
            <div className={`
                absolute left-[-7px] top-0
                w-3 h-3 rounded-full
                ${isLatest ? 'bg-accent' : 'bg-border'}
            `} />

            <div className={`
                rounded-md border border-border p-4
                ${isLatest ? 'bg-accent/5' : 'bg-card'}
                group hover:border-muted-foreground
                transition-colors
            `}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold text-foreground">
                                v{version}
                            </span>
                            {isLatest && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded">
                                    Latest
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(date)}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * VersionEntryForm - Form for adding/editing version entries
 */
export const VersionEntryForm = ({
    initialVersion = '',
    initialDescription = '',
    onSave,
    onCancel
}) => {
    const [version, setVersion] = React.useState(initialVersion);
    const [description, setDescription] = React.useState(initialDescription);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (version.trim() && description.trim()) {
            onSave({ version: version.trim(), description: description.trim() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-md border border-accent/50 p-4 bg-accent/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                        Version
                    </label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="
                            w-full px-3 py-2
                            rounded-md border border-input bg-background
                            text-foreground font-mono text-sm
                            placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-ring
                        "
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's new in this version?"
                        className="
                            w-full px-3 py-2
                            rounded-md border border-input bg-background
                            text-foreground text-sm
                            placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-ring
                        "
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!version.trim() || !description.trim()}
                    className="
                        px-3 py-1.5 rounded text-sm font-medium
                        bg-primary text-primary-foreground
                        hover:bg-primary/90 disabled:opacity-50
                        transition-colors
                    "
                >
                    Save
                </button>
            </div>
        </form>
    );
};
