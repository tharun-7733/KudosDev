import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase, Users, Rocket, Search, MapPin, Clock,
    DollarSign, Building2, ExternalLink, Code2, Github,
    CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';

// Sample job data (will be from API later)
const SAMPLE_JOBS = [
    {
        id: 1,
        title: 'Frontend Developer Intern',
        company: 'TechStartup Inc.',
        location: 'Remote',
        type: 'Internship',
        salary: '$20-30/hr',
        tech: ['React', 'TypeScript', 'Tailwind'],
        posted: '2 days ago',
        description: 'Looking for a passionate frontend developer to join our team...'
    },
    {
        id: 2,
        title: 'Freelance Backend Developer',
        company: 'IndieHacker',
        location: 'Remote',
        type: 'Freelance',
        tech: ['Node.js', 'PostgreSQL', 'AWS'],
        posted: '1 day ago',
        description: 'Need help building REST APIs for my SaaS product...'
    },
    {
        id: 3,
        title: 'Junior Full Stack Developer',
        company: 'GrowthCo',
        location: 'San Francisco, CA',
        type: 'Entry-level',
        salary: '$80-100k',
        tech: ['React', 'Python', 'Django'],
        posted: '3 days ago',
        description: 'Join our growing engineering team and work on exciting projects...'
    }
];

// Sample contributor requests
const CONTRIBUTOR_REQUESTS = [
    {
        id: 1,
        project: 'DevPortfolio',
        author: 'johndoe',
        looking_for: 'UI/UX Designer',
        tech: ['Figma', 'React'],
        description: 'Need help designing the dashboard and improving UX flow.'
    },
    {
        id: 2,
        project: 'OpenAPI Generator',
        author: 'janesmith',
        looking_for: 'Backend Developer',
        tech: ['Go', 'OpenAPI'],
        description: 'Looking for contributor to help with OpenAPI spec parsing.'
    }
];

export default function Careers() {
    const { isAuthenticated } = useAuth();
    const [activeSection, setActiveSection] = useState('jobs');
    const [searchQuery, setSearchQuery] = useState('');
    const [openToWork, setOpenToWork] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-10 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Briefcase className="w-64 h-64" />
                    </div>
                    <div className="relative">
                        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-foreground mb-3">
                            Careers & Opportunities
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                            Your projects speak louder than resumes. Find opportunities based on what you've built,
                            or discover talented developers for your team.
                        </p>

                        {/* Open to Work Toggle (for authenticated users) */}
                        {isAuthenticated && (
                            <div className="inline-flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                <span className="text-sm text-foreground">
                                    {openToWork ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            You're visible to recruiters
                                        </span>
                                    ) : (
                                        "Show you're open to work"
                                    )}
                                </span>
                                <button
                                    onClick={() => setOpenToWork(!openToWork)}
                                    className={`
                                        relative w-11 h-6 rounded-full transition-colors
                                        ${openToWork ? 'bg-green-500' : 'bg-muted'}
                                    `}
                                >
                                    <span
                                        className={`
                                            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                                            transition-transform
                                            ${openToWork ? 'translate-x-5' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs, roles, or technologies…"
                        className="
                            w-full pl-12 pr-4 py-3
                            rounded-xl border border-input bg-card
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                            transition-all shadow-sm
                        "
                    />
                </div>

                {/* Section Tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    <button
                        onClick={() => setActiveSection('jobs')}
                        className={`
                            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                            text-sm font-medium transition-all
                            ${activeSection === 'jobs'
                                ? 'bg-accent text-accent-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:text-foreground'}
                        `}
                    >
                        <Briefcase className="w-4 h-4" />
                        Job Listings
                    </button>
                    <button
                        onClick={() => setActiveSection('contributors')}
                        className={`
                            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                            text-sm font-medium transition-all
                            ${activeSection === 'contributors'
                                ? 'bg-accent text-accent-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:text-foreground'}
                        `}
                    >
                        <Users className="w-4 h-4" />
                        Looking for Contributors
                    </button>
                </div>

                {/* Content */}
                {activeSection === 'jobs' ? (
                    <div className="space-y-4">
                        {/* Info Banner */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20 mb-6">
                            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-foreground font-medium">Project-Based Hiring</p>
                                <p className="text-sm text-muted-foreground">
                                    Recruiters on KudosDev evaluate your projects first, not just your resume.
                                    Keep your portfolio updated!
                                </p>
                            </div>
                        </div>

                        {/* Job Cards */}
                        {SAMPLE_JOBS.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}

                        {/* Load More */}
                        <div className="text-center pt-4">
                            <button className="text-sm text-muted-foreground hover:text-foreground">
                                View more opportunities...
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Info Banner */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20 mb-6">
                            <Rocket className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-foreground font-medium">Collaborate on Projects</p>
                                <p className="text-sm text-muted-foreground">
                                    Developers are looking for collaborators for their open source and side projects.
                                    Join a project and build together!
                                </p>
                            </div>
                        </div>

                        {/* Contributor Request Cards */}
                        {CONTRIBUTOR_REQUESTS.map(req => (
                            <ContributorCard key={req.id} request={req} />
                        ))}

                        {/* Post Request CTA */}
                        {isAuthenticated && (
                            <div className="text-center pt-6 pb-2">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                                >
                                    Looking for contributors? Add a request to your project
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

/* Job Card Component */
const JobCard = ({ job }) => {
    const typeColors = {
        'Internship': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        'Freelance': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        'Entry-level': 'bg-green-500/10 text-green-600 dark:text-green-400',
        'Full-time': 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    };

    return (
        <div className="group rounded-lg border border-border bg-card p-5 hover:border-accent/50 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Title & Company */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                        </span>
                        {job.salary && (
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {job.salary}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted}
                        </span>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.tech.map(tech => (
                            <span
                                key={tech}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Type Badge & Action */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[job.type] || 'bg-muted text-muted-foreground'}`}>
                        {job.type}
                    </span>
                    <button className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                        View Details
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* Contributor Request Card */
const ContributorCard = ({ request }) => {
    return (
        <div className="group rounded-lg border border-border bg-card p-5 hover:border-accent/50 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Project & Author */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Code2 className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                                {request.project}
                            </h3>
                            <p className="text-sm text-muted-foreground">by @{request.author}</p>
                        </div>
                    </div>

                    {/* Looking For */}
                    <div className="mt-3">
                        <span className="text-sm text-foreground font-medium">Looking for: </span>
                        <span className="text-sm text-accent">{request.looking_for}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mt-2">
                        {request.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {request.tech.map(tech => (
                            <span
                                key={tech}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
                        <Github className="w-4 h-4" />
                        Contribute
                    </button>
                </div>
            </div>
        </div>
    );
};
