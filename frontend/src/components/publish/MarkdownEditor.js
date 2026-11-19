import React, { useState } from 'react';
import { Eye, Edit3, Bold, Italic, Code, Link as LinkIcon, List, Heading } from 'lucide-react';

/**
 * MarkdownEditor - Split-view Markdown editor with live preview
 */
export const MarkdownEditor = ({
    value = '',
    onChange,
    placeholder = 'Write your documentation here...',
    minHeight = '300px'
}) => {
    const [mode, setMode] = useState('write'); // 'write' or 'preview'

    // Simple markdown to HTML conversion for preview
    const renderMarkdown = (text) => {
        if (!text) return '<p class="text-muted-foreground">Nothing to preview</p>';

        let html = text
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-heading font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-heading font-semibold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-heading font-bold mt-6 mb-3">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```([^`]+)```/gim, '<pre class="bg-muted p-3 rounded-md my-3 overflow-x-auto font-mono text-sm"><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>')
            // Unordered lists
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
            // Line breaks
            .replace(/\n/gim, '<br />');

        return html;
    };

    // Insert markdown syntax
    const insertSyntax = (before, after = '') => {
        const textarea = document.getElementById('markdown-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const newValue =
            value.substring(0, start) +
            before + selectedText + after +
            value.substring(end);

        onChange(newValue);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    return (
        <div className="rounded-md border border-input overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                {/* Mode Toggle */}
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setMode('write')}
                        className={`
                            px-3 py-1.5 rounded text-sm font-medium
                            transition-colors inline-flex items-center gap-1.5
                            ${mode === 'write'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }
                        `}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`
                            px-3 py-1.5 rounded text-sm font-medium
                            transition-colors inline-flex items-center gap-1.5
                            ${mode === 'preview'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }
                        `}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                </div>

                {/* Formatting Buttons (only in write mode) */}
                {mode === 'write' && (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => insertSyntax('## ', '')}
                            title="Heading"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Heading className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertSyntax('**', '**')}
                            title="Bold"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertSyntax('*', '*')}
                            title="Italic"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertSyntax('`', '`')}
                            title="Inline Code"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Code className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertSyntax('[', '](url)')}
                            title="Link"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertSyntax('- ', '')}
                            title="List"
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Editor / Preview */}
            {mode === 'write' ? (
                <textarea
                    id="markdown-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`
                        w-full p-4 bg-background
                        text-foreground font-mono text-sm
                        placeholder:text-muted-foreground
                        resize-none focus:outline-none
                    `}
                    style={{ minHeight }}
                />
            ) : (
                <div
                    className="p-4 bg-background prose prose-invert max-w-none"
                    style={{ minHeight }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
            )}
        </div>
    );
};
