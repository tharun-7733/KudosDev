import React, { useState } from 'react';
import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ title, slug }) {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: 'Twitter / X',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: 'hover:text-[#1DA1F2]',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: 'hover:text-[#0A66C2]',
        },
        {
            name: 'WhatsApp',
            icon: () => <span className="text-sm">💬</span>,
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: 'hover:text-[#25D366]',
        },
        {
            name: 'Reddit',
            icon: () => <span className="text-sm">🔗</span>,
            url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            color: 'hover:text-[#FF4500]',
        },
    ];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="flex items-center gap-2">
            {shareLinks.map(link => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className={`p-2 rounded-lg border border-border text-muted-foreground ${link.color} hover:bg-muted transition-all`}
                >
                    <link.icon className="w-4 h-4" />
                </a>
            ))}
            <button
                onClick={copyLink}
                title="Copy link"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-accent hover:bg-muted transition-all"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
            </button>
        </div>
    );
}
