import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '../components/layout/Header';
import { authAPI } from '../lib/api';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword({
                token,
                new_password: password
            });
            setSuccess(true);
            toast.success('Password reset successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    {!success ? (
                        <>
                            <div className="text-center">
                                <h1 className="font-heading font-bold text-4xl tracking-tight text-foreground">
                                    Set New Password
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Please enter your new password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-card border border-border rounded-lg p-8 shadow-sm">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center space-y-6 bg-card border border-border rounded-lg p-8 shadow-sm">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                            <div>
                                <h2 className="font-heading font-bold text-2xl text-foreground">Password Reset!</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Your password has been successfully updated. You can now log in with your new password.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link
                                    to="/login"
                                    className="w-full block bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all text-center"
                                >
                                    Log In Now
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
