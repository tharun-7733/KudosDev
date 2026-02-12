import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { toast } from 'sonner';
import {
    User,
    Mail,
    Lock,
    Moon,
    Sun,
    Save,
    UserCircle,
    Palette
} from 'lucide-react';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || '',
        skills: user?.skills?.join(', ') || ''
    });

    // Account State
    const [accountData, setAccountData] = useState({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccountData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToUpdate = {
                ...profileData,
                skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean)
            };
            await updateUser(dataToUpdate);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        if (accountData.newPassword !== accountData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            // Only update email for now as password change might need a different endpoint
            await updateUser({ email: accountData.email });
            toast.success('Account settings updated');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update account');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Public Profile', icon: UserCircle },
        { id: 'account', label: 'Account Settings', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="font-heading font-bold text-3xl text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Navigation sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                                    `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Avatar URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Avatar URL
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0 border border-border">
                                                {profileData.avatar_url ? (
                                                    <img src={profileData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="url"
                                                name="avatar_url"
                                                value={profileData.avatar_url}
                                                onChange={handleProfileChange}
                                                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={profileData.full_name}
                                            onChange={handleProfileChange}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            rows={4}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                            placeholder="Tell the world about yourself..."
                                        />
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Skills (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={profileData.skills}
                                            onChange={handleProfileChange}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="React, Python, Node.js"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'account' && (
                            <form onSubmit={handleAccountSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={accountData.email}
                                                onChange={handleAccountChange}
                                                className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-border">
                                        <h3 className="text-sm font-medium text-foreground mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs text-muted-foreground mb-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={accountData.currentPassword}
                                                    onChange={handleAccountChange}
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    disabled // Mock for now
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={accountData.newPassword}
                                                        onChange={handleAccountChange}
                                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                        disabled // Mock for now
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={accountData.confirmPassword}
                                                        onChange={handleAccountChange}
                                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                        disabled // Mock for now
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">
                                                Password updates are currently disabled in this demo.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-foreground mb-4">Theme Preference</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => theme === 'dark' && toggleTheme()}
                                            className={`
                                                flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left
                                                ${theme === 'light'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-border/80 bg-card'}
                                            `}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Sun className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Light Mode</p>
                                                <p className="text-xs text-muted-foreground mt-1">Clean and crisp appearance</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => theme === 'light' && toggleTheme()}
                                            className={`
                                                flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left
                                                ${theme === 'dark'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-border/80 bg-card'}
                                            `}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Moon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Dark Mode</p>
                                                <p className="text-xs text-muted-foreground mt-1">Easy on the eyes in low light</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Your theme preference is saved automatically to your browser.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
