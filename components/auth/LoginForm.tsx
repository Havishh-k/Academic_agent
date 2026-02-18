import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Mic, ShieldCheck, Clock, Smartphone } from 'lucide-react';

interface LoginFormProps {
    onSwitchToSignup: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
}

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="flex items-start gap-3 mb-5">
        <div className="p-2 bg-blue-100 rounded-lg text-[#2B5797] shrink-0">
            <Icon size={18} />
        </div>
        <div>
            <h4 className="font-semibold text-[#2B5797] text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
    </div>
);

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
            window.history.replaceState({}, '', window.location.pathname);
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
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* ─── Left Column · 40% · Feature / Trust Panel ─── */}
            <div className="hidden lg:flex w-[42%] bg-white flex-col justify-between p-10 xl:p-12 border-r border-gray-200">
                {/* Logo + Title */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            VSIT
                        </div>
                        <h1 className="text-xl xl:text-2xl font-bold text-[#2B5797] leading-tight">
                            VSIT AI Academic Agent
                        </h1>
                    </div>

                    {/* NAAC Badge */}
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-bold inline-block mb-10">
                        RE-ACCREDITED: GRADE 'A' BY NAAC
                    </div>

                    {/* Feature List */}
                    <FeatureItem icon={BookOpen} title="AI Academic Agent" desc="Personalized learning companion powered by AI" />
                    <FeatureItem icon={CheckCircle} title="Real-time Performance Tracking" desc="Know your strengths and improve weak areas" />
                    <FeatureItem icon={Mic} title="Voice-First Interaction" desc="Accessible for all users with VIP mode" />
                    <FeatureItem icon={ShieldCheck} title="Faculty-Approved Content" desc="All notes vetted by department faculty" />
                    <FeatureItem icon={Clock} title="Secure Authentication" desc="Enhanced security with email verification" />
                    <FeatureItem icon={Smartphone} title="Multi-Device Support" desc="Learn anywhere, anytime" />
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                    © 2026 Vidyalankar School of Information Technology
                </div>
            </div>

            {/* ─── Right Column · 60% · Login Form ─── */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-[480px]">
                    {/* Mobile logo (hidden on lg+) */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            VSIT
                        </div>
                        <h1 className="text-xl font-bold text-[#2B5797]">VSIT AI Academic Agent</h1>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        {/* Tab Header */}
                        <div className="flex border-b border-gray-200 mb-8">
                            <button className="flex-1 pb-4 font-semibold text-center text-[#2B5797] border-b-2 border-[#2B5797]">
                                Login
                            </button>
                            <button
                                onClick={onSwitchToSignup}
                                className="flex-1 pb-4 font-semibold text-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Register
                            </button>
                        </div>

                        {/* Email confirmed banner */}
                        <AnimatePresence>
                            {showConfirmed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800 text-sm">Email Confirmed! 🎉</p>
                                        <p className="text-green-600 text-xs">Your account is active. Sign in below.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Form */}
                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    VSIT Email ID
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@vsit.edu.in"
                                    pattern=".+@vsit\.edu\.in$"
                                    title="Only @vsit.edu.in emails are allowed"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="text-right">
                                <button type="button" className="text-sm text-[#2B5797] hover:underline font-medium">
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2B5797] text-white py-3 rounded-full font-semibold hover:bg-[#1a3a6e] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Login to Portal'
                                )}
                            </button>
                        </motion.form>

                        {/* Switch to signup */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{' '}
                                <button
                                    onClick={onSwitchToSignup}
                                    className="font-semibold text-[#2B5797] hover:underline transition-colors"
                                >
                                    Register
                                </button>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Multi-Agent Academic System • Powered by Groq + Supabase
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
