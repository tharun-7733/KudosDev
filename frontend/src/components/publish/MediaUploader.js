import React, { useState, useRef } from 'react';
import { Upload, X, Film, Link as LinkIcon } from 'lucide-react';

/**
 * MediaUploader - Drag-drop file upload with preview grid
 */
export const MediaUploader = ({
    value = [],
    onChange,
    accept = 'image/*',
    maxFiles = 5,
    maxSizeMB = 5
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
            return isValidType && isValidSize;
        });

        const availableSlots = maxFiles - value.length;
        const filesToAdd = validFiles.slice(0, availableSlots);

        // Create preview URLs
        const newItems = filesToAdd.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        onChange([...value, ...newItems]);
    };

    const removeItem = (id) => {
        const item = value.find(v => v.id === id);
        if (item?.preview) {
            URL.revokeObjectURL(item.preview);
        }
        onChange(value.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            {value.length < maxFiles && (
                <div
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-lg
                        p-8 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                        }
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        multiple
                        onChange={(e) => handleFiles(Array.from(e.target.files))}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${isDragging ? 'bg-accent/20' : 'bg-muted'}
                            transition-colors
                        `}>
                            <Upload className={`
                                w-6 h-6 
                                ${isDragging ? 'text-accent' : 'text-muted-foreground'}
                            `} />
                        </div>

                        <div>
                            <p className="text-foreground font-medium">
                                {isDragging ? 'Drop files here' : 'Drop files here or click to upload'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                PNG, JPG up to {maxSizeMB}MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {value.map((item) => (
                        <div
                            key={item.id}
                            className="
                                relative group rounded-lg overflow-hidden
                                aspect-video bg-muted
                                border border-border
                            "
                        >
                            <img
                                src={item.preview || item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="
                                absolute inset-0 bg-background/80
                                opacity-0 group-hover:opacity-100
                                transition-opacity
                                flex items-center justify-center
                            ">
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    className="
                                        p-2 rounded-full
                                        bg-destructive text-destructive-foreground
                                        hover:bg-destructive/90
                                        transition-colors
                                    "
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* File Name */}
                            <div className="
                                absolute bottom-0 left-0 right-0
                                px-2 py-1 bg-background/80
                                text-xs text-muted-foreground truncate
                            ">
                                {item.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Counter */}
            <div className="text-xs text-muted-foreground text-right">
                {value.length}/{maxFiles} images
            </div>
        </div>
    );
};

/**
 * VideoInput - Input for video URL or file upload
 */
export const VideoInput = ({
    value = '',
    onChange,
    type = 'url' // 'url' or 'file'
}) => {
    const [inputType, setInputType] = useState(type);

    return (
        <div className="space-y-3">
            {/* Type Toggle */}
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="videoType"
                        checked={inputType === 'url'}
                        onChange={() => setInputType('url')}
                        className="w-4 h-4 text-accent"
                    />
                    <span className="text-sm text-foreground">YouTube/Vimeo URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="videoType"
                        checked={inputType === 'file'}
                        onChange={() => setInputType('file')}
                        className="w-4 h-4 text-accent"
                    />
                    <span className="text-sm text-foreground">Upload video file</span>
                </label>
            </div>

            {/* URL Input */}
            {inputType === 'url' && (
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="
                            w-full pl-10 pr-4 py-2.5
                            rounded-md border border-input bg-background
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                            transition-all
                        "
                    />
                </div>
            )}

            {/* File Upload */}
            {inputType === 'file' && (
                <div className="
                    border-2 border-dashed border-border rounded-lg
                    p-6 text-center cursor-pointer
                    hover:border-muted-foreground hover:bg-muted/30
                    transition-colors
                ">
                    <Film className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Video upload coming soon
                    </p>
                </div>
            )}
        </div>
    );
};
