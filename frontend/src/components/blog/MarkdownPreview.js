import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownPreview({ content }) {
    return (
        <div className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-foreground/90 prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:text-accent prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-blockquote:border-accent prose-blockquote:text-muted-foreground
            prose-li:text-foreground/90
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-border
            prose-table:border-border
            prose-th:text-foreground prose-th:border-border prose-th:px-4 prose-th:py-2
            prose-td:text-foreground/90 prose-td:border-border prose-td:px-4 prose-td:py-2
        ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg !bg-[#1e1e2e] text-sm"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
}
