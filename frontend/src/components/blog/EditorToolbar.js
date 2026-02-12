import React from 'react';
import { Bold, Italic, Heading1, Heading2, Heading3, Code, Link, Image, List, ListOrdered, Quote, Minus } from 'lucide-react';

const TOOLS = [
    { icon: Bold, label: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
    { icon: Italic, label: 'Italic', prefix: '*', suffix: '*', placeholder: 'italic text' },
    { type: 'separator' },
    { icon: Heading1, label: 'Heading 1', prefix: '# ', suffix: '', placeholder: 'Heading', block: true },
    { icon: Heading2, label: 'Heading 2', prefix: '## ', suffix: '', placeholder: 'Heading', block: true },
    { icon: Heading3, label: 'Heading 3', prefix: '### ', suffix: '', placeholder: 'Heading', block: true },
    { type: 'separator' },
    { icon: Code, label: 'Code Block', prefix: '```\n', suffix: '\n```', placeholder: 'code here', block: true },
    { icon: Quote, label: 'Blockquote', prefix: '> ', suffix: '', placeholder: 'quote', block: true },
    { icon: Minus, label: 'Divider', prefix: '\n---\n', suffix: '', placeholder: '', block: true },
    { type: 'separator' },
    { icon: List, label: 'Bullet List', prefix: '- ', suffix: '', placeholder: 'list item', block: true },
    { icon: ListOrdered, label: 'Numbered List', prefix: '1. ', suffix: '', placeholder: 'list item', block: true },
    { type: 'separator' },
    { icon: Link, label: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
    { icon: Image, label: 'Image', prefix: '![', suffix: '](url)', placeholder: 'alt text' },
];

export default function EditorToolbar({ textareaRef }) {
    const applyFormat = (tool) => {
        const textarea = textareaRef?.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.slice(start, end) || tool.placeholder;

        let before = text.slice(0, start);
        let after = text.slice(end);

        // For block-level elements, ensure they start on a new line
        if (tool.block && before.length > 0 && !before.endsWith('\n')) {
            before += '\n';
        }

        const newText = before + tool.prefix + selected + tool.suffix + after;

        // Trigger React's onChange via native input event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeInputValueSetter.call(textarea, newText);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        // Set cursor position
        const cursorPos = before.length + tool.prefix.length + selected.length;
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                before.length + tool.prefix.length,
                cursorPos
            );
        }, 0);
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
                        onClick={() => applyFormat(tool)}
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
