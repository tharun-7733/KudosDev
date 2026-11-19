import React from 'react';
import { Bold, Italic, Heading1, Heading2, Heading3, Code, Link, Image, List, ListOrdered, Quote, Minus } from 'lucide-react';

const TOOLS = [
    { type: 'bold', icon: Bold, label: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
    { type: 'italic', icon: Italic, label: 'Italic', prefix: '*', suffix: '*', placeholder: 'italic text' },
    { type: 'separator' },
    { type: 'h1', icon: Heading1, label: 'Heading 1', prefix: '# ', suffix: '', placeholder: 'Heading', block: true },
    { type: 'h2', icon: Heading2, label: 'Heading 2', prefix: '## ', suffix: '', placeholder: 'Heading', block: true },
    { type: 'h3', icon: Heading3, label: 'Heading 3', prefix: '### ', suffix: '', placeholder: 'Heading', block: true },
    { type: 'separator' },
    { type: 'code', icon: Code, label: 'Code Block', prefix: '```\n', suffix: '\n```', placeholder: 'code here', block: true },
    { type: 'quote', icon: Quote, label: 'Blockquote', prefix: '> ', suffix: '', placeholder: 'quote', block: true },
    { type: 'hr', icon: Minus, label: 'Divider', prefix: '\n---\n', suffix: '', placeholder: '', block: true },
    { type: 'separator' },
    { type: 'ul', icon: List, label: 'Bullet List', prefix: '- ', suffix: '', placeholder: 'list item', block: true },
    { type: 'ol', icon: ListOrdered, label: 'Numbered List', prefix: '1. ', suffix: '', placeholder: 'list item', block: true },
    { type: 'separator' },
    { type: 'link', icon: Link, label: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
    { type: 'image', icon: Image, label: 'Upload Image' },
];

export default function EditorToolbar({ textareaRef, onImageUpload }) {

    const insertText = (prefix, suffix, placeholder = '', isBlock = false) => {
        const textarea = textareaRef?.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.slice(start, end) || placeholder;

        let before = text.slice(0, start);
        let after = text.slice(end);

        if (isBlock && before.length > 0 && !before.endsWith('\n')) {
            before += '\n';
        }

        const newText = before + prefix + selected + suffix + after;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeInputValueSetter.call(textarea, newText);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        const cursorPos = before.length + prefix.length + selected.length;
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                before.length + prefix.length,
                cursorPos
            );
        }, 0);
    };

    const handleClick = (tool) => {
        if (tool.type === 'image') {
            if (onImageUpload) onImageUpload();
        } else {
            insertText(tool.prefix, tool.suffix, tool.placeholder, tool.block);
        }
    };

    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/30 flex-wrap">
            {TOOLS.map((tool, i) =>
                tool.type === 'separator' ? (
                    <div key={i} className="w-px h-5 bg-border mx-1" />
                ) : (
                    <button
                        key={i}
                        type="button"
                        onClick={() => handleClick(tool)}
                        title={tool.label}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <tool.icon className="w-4 h-4" />
                    </button>
                )
            )}
        </div>
    );
}
