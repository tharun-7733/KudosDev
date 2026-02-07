import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../lib/api';
import { toast } from 'sonner';
import { Header } from '../components/layout/Header';
import { Plus, ExternalLink } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectAPI.getMy();
            setProjects(response.data);
        } catch (error) {
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* User Info */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="font-heading font-bold text-3xl tracking-tight text-foreground">
                                {user?.full_name}
                            </h1>
                            <p className="text-muted-foreground">@{user?.username}</p>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="font-heading font-semibold text-2xl tracking-tight text-foreground">
                                My Projects
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Showcase your work and track your progress
                            </p>
                        </div>
                        <button
                            onClick={() => toast.info('Create project feature coming soon!')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all active:scale-95 inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground mt-4">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            <div className="max-w-md mx-auto">
                                <h3 className="font-heading font-medium text-xl text-foreground mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Create your first project to start building your developer portfolio
                                </p>
                                <button
                                    onClick={() => toast.info('Create project feature coming soon!')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-all inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your First Project
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div
                                    key={project.project_id}
                                    className="rounded-lg border border-border bg-card p-6 hover:border-accent hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-heading font-semibold text-lg tracking-tight text-foreground group-hover:text-accent transition-colors">
                                            {project.title}
                                        </h3>
                                        {project.live_url && (
                                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech_stack?.slice(0, 3).map((tech) => (
                                            <span
                                                key={tech}
                                                className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {project.tech_stack?.length > 3 && (
                                            <span className="text-xs font-mono text-muted-foreground">
                                                +{project.tech_stack.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
