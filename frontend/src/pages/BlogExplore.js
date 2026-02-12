import React, { useState, useEffect } from 'react';
import { blogAPI } from '../lib/api';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import BlogCard from '../components/blog/BlogCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['all', 'devlog', 'tutorial', 'opinion', 'showcase'];

export default function BlogExplore() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchBlogs();
    }, [activeCategory]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeCategory !== 'all') params.category = activeCategory;
            const res = await blogAPI.getAll(params);
            setBlogs(res.data || []);
        } catch {
            console.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="font-heading font-bold text-4xl md:text-5xl tracking-tight text-foreground mb-4">
                        Developer Blog
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stories, tutorials, and insights from developers building in public.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search blogs..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex gap-1 p-1 bg-muted rounded-lg self-start">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`
                                    px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all
                                    ${activeCategory === cat
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                                <div className="aspect-video bg-muted animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                                    <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map(blog => (
                            <BlogCard key={blog.blog_id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <span className="text-4xl mb-4 block">📝</span>
                        <h3 className="font-heading font-medium text-xl text-foreground mb-2">
                            No blogs yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Be the first to publish a blog post!
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
