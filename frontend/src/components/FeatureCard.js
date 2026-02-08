import React from 'react';

export const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-xs">
                    {description}
                </p>
            )}
        </div>
    );
};
