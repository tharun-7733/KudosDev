import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { projectAPI, userAPI } from '../lib/api';
import {
    Search, Filter, TrendingUp, Clock, Star,
    ExternalLink, Github, Users, Code2, Briefcase,
    ChevronDown
} from 'lucide-react';

// Tech stack options for filtering
const TECH_STACKS = [
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js',
    'Python', 'Django', 'FastAPI', 'Go', 'Rust',
    'TypeScript', 'JavaScript', 'PostgreSQL', 'MongoDB'
];

// Sort options
const SORT_OPTIONS = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'popular', label: 'Most Popular', icon: Star }
];

export default function Explore() {
    const [activeTab, setActiveTab] = useState('projects');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('trending');
    const [selectedTech, setSelectedTech] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Data states
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'projects') {
                const response = await projectAPI.getAll();
                setProjects(response.data || []);
            } else {
                // For now, show empty - will need backend endpoint
                setDevelopers([]);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter projects based on search and tech stack
    const filteredProjects = projects.filter(project => {
        const matchesSearch = !searchQuery ||
            project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTech = selectedTech.length === 0 ||
            selectedTech.some(tech => project.tech_stack?.includes(tech));

        return matchesSearch && matchesTech;
    });

    const toggleTech = (tech) => {
        setSelectedTech(prev =>
            prev.includes(tech)
                ? prev.filter(t => t !== tech)
                : [...prev, tech]
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-foreground mb-3">
                        Explore Projects & Developers
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover what developers are building in public. Find inspiration, learn, and connect.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search developers, projects, or technologies…"
                        className="
                            w-full pl-12 pr-4 py-3.5
                            rounded-xl border border-input bg-card
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                            text-base transition-all shadow-sm
                        "
                    />
                </div>

                {/* Tabs & Filters Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`
                                px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${activeTab === 'projects'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'}
                            `}
                        >
                            <Code2 className="w-4 h-4 inline-block mr-2" />
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('developers')}
                            className={`
                                px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${activeTab === 'developers'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'}
                            `}
                        >
                            <Users className="w-4 h-4 inline-block mr-2" />
                            Developers
                        </button>
                    </div>

                    {/* Sort & Filter Controls */}
                    <div className="flex items-center gap-3">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="
                                px-3 py-2 rounded-md border border-input bg-card
                                text-sm text-foreground
                                focus:outline-none focus:ring-2 focus:ring-ring
                            "
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`
                                inline-flex items-center gap-2 px-3 py-2 rounded-md border
                                text-sm font-medium transition-colors
                                ${showFilters
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-input bg-card text-foreground hover:bg-muted'}
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {selectedTech.length > 0 && (
                                <span className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                                    {selectedTech.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mb-6 p-4 rounded-lg border border-border bg-card">
                        <h3 className="text-sm font-medium text-foreground mb-3">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {TECH_STACKS.map(tech => (
                                <button
                                    key={tech}
                                    onClick={() => toggleTech(tech)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                                        ${selectedTech.includes(tech)
                                            ? 'bg-accent text-accent-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                                    `}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>
                        {selectedTech.length > 0 && (
                            <button
                                onClick={() => setSelectedTech([])}
                                className="mt-3 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
                                <div className="h-32 bg-muted rounded-md mb-4" />
                                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'projects' ? (
                    /* Projects Grid */
                    filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <ProjectCard key={project.project_id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No projects found"
                            description="Be the first to publish a project!"
                        />
                    )
                ) : (
                    /* Developers Grid */
                    developers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {developers.map(dev => (
                                <DeveloperCard key={dev.username} developer={dev} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No developers yet"
                            description="Developers will appear here as they publish projects."
                        />
                    )
                )}
            </main>
        </div>
    );
}

/* Project Card Component */
const ProjectCard = ({ project }) => {
    return (
        <Link
            to={`/project/${project.project_id}`}
            className="group rounded-lg border border-border bg-card overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all"
        >
            {/* Thumbnail */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                {project.thumbnail_url ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Code2 className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                )}

                {/* Category Badge */}
                <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md text-foreground">
                    {project.category}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tech_stack?.slice(0, 3).map(tech => (
                        <span
                            key={tech}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.tech_stack?.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                            +{project.tech_stack.length - 3}
                        </span>
                    )}
                </div>

                {/* Author & Stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                        by @{project.user_username}
                    </span>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        {project.github_url && (
                            <Github className="w-4 h-4" />
                        )}
                        {project.live_url && (
                            <ExternalLink className="w-4 h-4" />
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* Developer Card Component */
const DeveloperCard = ({ developer }) => {
    const getInitials = (name) => {
        if (!name) return 'D';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Link
            to={`/profile/${developer.username}`}
            className="group rounded-lg border border-border bg-card p-4 hover:border-accent/50 hover:shadow-lg transition-all text-center"
        >
            {/* Avatar */}
            {developer.avatar_url ? (
                <img
                    src={developer.avatar_url}
                    alt={developer.full_name}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-border group-hover:border-accent transition-colors"
                />
            ) : (
                <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-accent flex items-center justify-center text-accent-foreground text-lg font-medium">
                    {getInitials(developer.full_name)}
                </div>
            )}

            {/* Name */}
            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                {developer.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">
                @{developer.username}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap justify-center gap-1 mt-3">
                {developer.skills?.slice(0, 3).map(skill => (
                    <span
                        key={skill}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                        {skill}
                    </span>
                ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {developer.project_count || 0} projects
                </span>
            </div>
        </Link>
    );
};

/* Empty State Component */
const EmptyState = ({ title, description }) => (
    <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);
