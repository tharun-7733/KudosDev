import React, { useState, useRef } from 'react';
import { X, Hash } from 'lucide-react';

// Popular tags for suggestions
const POPULAR_TAGS = [
    'fullstack', 'frontend', 'backend', 'api', 'saas', 'portfolio',
    'opensource', 'learning', 'hackathon', 'sideproject', 'startup',
    'mobile', 'desktop', 'cli', 'devtools', 'productivity',
    'ai', 'ml', 'blockchain', 'web3', 'fintech', 'edtech'
];

/**
 * TagInput - Chip input for project tags with suggestions
 */
export const TagInput = ({
    value = [],
    onChange,
    placeholder = 'Add tags...',
    maxTags = 5
}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    // Filter suggestions that haven't been selected
    const availableSuggestions = POPULAR_TAGS.filter(tag => !value.includes(tag));

    const addTag = (tag) => {
        const normalizedTag = tag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (normalizedTag && !value.includes(normalizedTag) && value.length < maxTags) {
            onChange([...value, normalizedTag]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    return (
        <div className="space-y-3">
            <div
                className={`
                    flex flex-wrap gap-2 p-3 
                    rounded-md border border-input bg-background
                    focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
                    transition-all cursor-text
                `}
                onClick={() => inputRef.current?.focus()}
            >
                {/* Tags */}
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="
                            inline-flex items-center gap-1 
                            px-2.5 py-1 rounded-full
                            bg-accent/10 text-accent
                            text-sm font-medium
                            border border-accent/20
                        "
                    >
                        <Hash className="w-3 h-3" />
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                            className="
                                text-accent/60 hover:text-destructive
                                transition-colors p-0.5 rounded-full
                                hover:bg-destructive/10
                            "
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                {/* Input */}
                {value.length < maxTags && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={value.length === 0 ? placeholder : ''}
                        className="
                            flex-1 min-w-[100px] bg-transparent outline-none
                            text-sm text-foreground
                            placeholder:text-muted-foreground
                        "
                    />
                )}
            </div>

            {/* Popular Tags */}
            {value.length < maxTags && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Popular:</span>
                    {availableSuggestions.slice(0, 8).map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="
                                text-xs text-muted-foreground hover:text-foreground
                                hover:underline transition-colors
                            "
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Counter */}
            <div className="text-xs text-muted-foreground text-right">
                {value.length}/{maxTags} tags
            </div>
        </div>
    );
};
