import React from 'react';
import { Header } from '../components/layout/Header';

export default function Explore() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <h1 className="font-heading font-bold text-4xl tracking-tight text-foreground mb-4">
                        Explore Projects
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover what developers are building in public. Browse projects, get inspired, and connect with the community.
                    </p>
                    <div className="mt-12 border-2 border-dashed border-border rounded-lg bg-muted/20 p-12">
                        <p className="text-muted-foreground font-mono">
                            Project explorer coming soon...
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
