import React, { useState, useEffect } from 'react';

interface LoginFormProps {
    onSwitchToSignup: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Detect email confirmation redirect
    const [showConfirmed, setShowConfirmed] = useState(false);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === 'true') {
            setShowConfirmed(true);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
            // Auto-dismiss after 8s
            const t = setTimeout(() => setShowConfirmed(false), 8000);
            return () => clearTimeout(t);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.toLowerCase().endsWith('@vsit.edu.in')) {
            setError('Only @vsit.edu.in email addresses are allowed.');
            return;
        }

        setLoading(true);
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academic-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-academic-600 to-academic-800 text-white mb-4 shadow-lg shadow-academic-200">
                        <span className="text-2xl font-serif font-bold">AI</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-academic-900 tracking-tight">Academic Agent</h1>
                    <p className="text-academic-500 text-sm mt-1">Sign in to your learning portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-academic-100/50 border border-academic-100 p-8">
                    {/* Email confirmed success banner */}
                    {showConfirmed && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 18px', marginBottom: 20, borderRadius: 14,
                            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                            border: '1px solid #6EE7B7',
                            animation: 'slideDown 0.4s ease-out',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10B981, #34D399)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                            }}>
                                <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✓</span>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#065F46', fontSize: 14, margin: 0 }}>
                                    Email Confirmed! 🎉
                                </p>
                                <p style={{ color: '#047857', fontSize: 12, margin: 0, marginTop: 2 }}>
                                    Your academic account is now active. Sign in to continue.
                                </p>
                            </div>
                        </div>
                    )}
                    <style>{`
                        @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-12px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-academic-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@vsit.edu.in"
                                pattern=".+@vsit\.edu\.in$"
                                title="Only @vsit.edu.in emails are allowed"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent transition-all bg-academic-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-academic-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent transition-all bg-academic-50/50"
                            />
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-academic-600 to-academic-800 text-white font-semibold text-sm shadow-lg shadow-academic-200 hover:shadow-xl hover:shadow-academic-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-academic-500">
                            Don't have an account?{' '}
                            <button
                                onClick={onSwitchToSignup}
                                className="font-semibold text-academic-700 hover:text-academic-900 underline underline-offset-2 transition-colors"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-academic-400 mt-6">
                    Multi-Agent Academic System • Powered by Groq + Supabase
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
