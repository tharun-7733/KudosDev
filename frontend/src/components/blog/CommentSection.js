import React, { useState, useEffect } from 'react';
import { blogAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Send, MessageSquare } from 'lucide-react';

export default function CommentSection({ blogId }) {
    const { isAuthenticated, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [blogId]);

    const fetchComments = async () => {
        try {
            const res = await blogAPI.getComments(blogId);
            setComments(res.data || []);
        } catch { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await blogAPI.addComment(blogId, { content: newComment.trim() });
            setNewComment('');
            fetchComments();
            toast.success('Comment posted!');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Organize into threads: top-level + replies
    const topLevel = comments.filter(c => !c.parent_comment_id);
    const replies = comments.filter(c => c.parent_comment_id);

    return (
        <div className="space-y-6">
            <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({comments.length})
            </h3>

            {/* Compose */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        {user?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-sm text-muted-foreground italic">
                    Log in to leave a comment.
                </p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {topLevel.map(comment => (
                    <div key={comment.comment_id} className="space-y-3">
                        <CommentItem comment={comment} formatDate={formatDate} />
                        {/* Replies */}
                        {replies
                            .filter(r => r.parent_comment_id === comment.comment_id)
                            .map(reply => (
                                <div key={reply.comment_id} className="ml-10">
                                    <CommentItem comment={reply} formatDate={formatDate} />
                                </div>
                            ))
                        }
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                )}
            </div>
        </div>
    );
}

function CommentItem({ comment, formatDate }) {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                {comment.author_full_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                        {comment.author_full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        @{comment.author_username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        · {formatDate(comment.created_at)}
                    </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                    {comment.content}
                </p>
            </div>
        </div>
    );
}
