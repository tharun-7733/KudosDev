import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { projectAPI, blogAPI } from '../lib/api';
import {
    ProfileHeader,
    AnalyticsCard,
    SkillsSection,
    ActivityTimeline,
    ResumeSection
} from '../components/profile';
import {
    LayoutGrid, List, Github, Eye, Star,
    Code2
} from 'lucide-react';

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser, isAuthenticated } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('all');
    const [isFollowing, setIsFollowing] = useState(false);

    // Determine if viewing own profile
    const isOwnProfile = isAuthenticated && currentUser?.username === username;

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            // Try to fetch user by username
            if (isOwnProfile) {
                // Use current user data for own profile
                setProfileUser(currentUser);
            } else {
                // Fetch public profile - for now use mock data
                // Will need backend endpoint: GET /api/users/:username
                setProfileUser({
                    username: username,
                    full_name: username.charAt(0).toUpperCase() + username.slice(1),
                    bio: 'Developer building awesome things',
                    skills: ['React', 'Python', 'Node.js'],
                    created_at: new Date().toISOString()
                });
            }

            // Fetch user's projects
            const projectsRes = await projectAPI.getAll();
            const userProjects = (projectsRes.data || []).filter(
                p => p.user_username === username
            );
            setProjects(userProjects);

            // Fetch blog data
            try {
                if (isOwnProfile) {
                    const blogRes = await blogAPI.getMy();
                    setBlogs(blogRes.data || []);
                } else {
                    const blogRes = await blogAPI.getAll();
                    const userBlogs = (blogRes.data || []).filter(
                        b => b.author_username === username
                    );
                    setBlogs(userBlogs);
                }
            } catch (error) {
                // Blog fetch is non-critical
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, [isOwnProfile, currentUser, username]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        // TODO: API call to follow/unfollow
    };

    // Mock stats for demo
    const stats = {
        projects: projects.length,
        blogPosts: blogs.length,
        blogViews: blogs.reduce((sum, b) => sum + (b.view_count || 0), 0),
        blogReactions: blogs.reduce((sum, b) => sum + (b.reaction_count || 0), 0),
        views: 1234,
        stars: 56,
        followers: 23,
        following: 15,
        profileVisits: 89
    };

    // Filter projects by tab
    const filteredProjects = projects.filter(p => {
        if (activeTab === 'all') return true;
        if (activeTab === 'featured') return p.is_featured;
        if (activeTab === 'archived') return p.status === 'archived';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Loading skeleton */}
                    <div className="animate-pulse">
                        <div className="h-40 bg-muted rounded-xl mb-6" />
                        <div className="h-24 bg-muted rounded-xl mb-6" />
                        <div className="h-32 bg-muted rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    // Mock lists for followers/following
    const followerList = [
        { username: 'janedoe', full_name: 'Jane Doe' },
        { username: 'bobsmith', full_name: 'Bob Smith' },
        { username: 'alice', full_name: 'Alice Johnson' },
        { username: 'charlie', full_name: 'Charlie Brown' },
        { username: 'dev_guru', full_name: 'Dev Guru' },
    ];

    const followingList = [
        { username: 'adminuser', full_name: 'Admin User' },
        { username: 'sarah_dev', full_name: 'Sarah Dev' },
        { username: 'mike_codes', full_name: 'Mike Codes' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <ProfileHeader
                    user={profileUser}
                    isOwnProfile={isOwnProfile}
                    onFollow={handleFollow}
                    isFollowing={isFollowing}
                />

                {/* Analytics */}
                <AnalyticsCard
                    stats={stats}
                    isOwnProfile={isOwnProfile}
                    followerList={followerList}
                    followingList={followingList}
                />

                {/* Two Column Layout for Skills + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Skills */}
                    <SkillsSection
                        skills={profileUser?.skills}
                        isOwnProfile={isOwnProfile}
                    />

                    {/* Activity Timeline */}
                    <ActivityTimeline isOwnProfile={isOwnProfile} />
                </div>

                {/* Resume & Links */}
                <ResumeSection user={profileUser} isOwnProfile={isOwnProfile} />

                {/* Projects Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                    {/* Projects Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="font-heading font-semibold text-lg text-foreground">
                            {isOwnProfile ? 'My Projects' : 'Projects'}
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-muted rounded-lg">
                                {['all', 'featured', 'archived'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            px-3 py-1 rounded-md text-xs font-medium capitalize transition-all
                                            ${activeTab === tab
                                                ? 'bg-card text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'}
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* View Toggle */}
                            <div className="flex border border-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid/List */}
                    {filteredProjects.length > 0 ? (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                            : 'space-y-3'
                        }>
                            {filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.project_id}
                                    project={project}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Code2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">
                                {isOwnProfile
                                    ? 'No projects yet. Start building!'
                                    : 'No published projects.'}
                            </p>
                            {isOwnProfile && (
                                <Link
                                    to="/publish"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
                                >
                                    Publish Your First Project
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

/* Project Card Component */
const ProjectCard = ({ project, viewMode }) => {
    if (viewMode === 'list') {
        return (
            <Link
                to={`/project/${project.project_id}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/50 transition-all"
            >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                    {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Code2 className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {project.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {project.stars || 0}
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/project/${project.project_id}`}
            className="group rounded-lg border border-border overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all"
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
                {/* Status Badge */}
                <span className={`
                    absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium
                    ${project.status === 'published'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'}
                `}>
                    {project.status}
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
                <div className="flex flex-wrap gap-1 mt-3">
                    {project.tech_stack?.slice(0, 3).map(tech => (
                        <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {project.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {project.stars || 0}
                        </span>
                    </div>
                    {project.github_url && <Github className="w-4 h-4 text-muted-foreground" />}
                </div>
            </div>
        </Link>
    );
};
