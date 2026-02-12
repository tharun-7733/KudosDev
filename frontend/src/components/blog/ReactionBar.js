import React, { useState, useEffect } from 'react';
import { blogAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const REACTION_TYPES = [
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'bulb', emoji: '💡', label: 'Insightful' },
    { type: 'clap', emoji: '👏', label: 'Clap' },
    { type: 'heart', emoji: '❤️', label: 'Love' },
];

export default function ReactionBar({ blogId }) {
    const { isAuthenticated } = useAuth();
    const [reactions, setReactions] = useState({});

    useEffect(() => {
        fetchReactions();
    }, [blogId]);

    const fetchReactions = async () => {
        try {
            const res = await blogAPI.getReactions(blogId);
            setReactions(res.data || {});
        } catch { }
    };

    const handleReact = async (type) => {
        if (!isAuthenticated) {
            toast.error('Please log in to react');
            return;
        }
        try {
            await blogAPI.react(blogId, { type });
            fetchReactions();
        } catch {
            toast.error('Failed to react');
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {REACTION_TYPES.map(({ type, emoji, label }) => {
                const count = reactions[type] || 0;
                return (
                    <button
                        key={type}
                        onClick={() => handleReact(type)}
                        title={label}
                        className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm
                            transition-all duration-200 hover:scale-105 active:scale-95
                            ${count > 0
                                ? 'border-accent/30 bg-accent/5 text-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-accent/30'
                            }
                        `}
                    >
                        <span className="text-base">{emoji}</span>
                        {count > 0 && <span className="font-medium">{count}</span>}
                    </button>
                );
            })}
        </div>
    );
}
