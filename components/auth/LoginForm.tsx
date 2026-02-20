import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Mic, ShieldCheck, Clock, Smartphone, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

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
    const [showForgot, setShowForgot] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    // Detect email confirmation redirect
    const [showConfirmed, setShowConfirmed] = useState(false);

    // Password recovery flow
    const [isRecovery, setIsRecovery] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryError, setRecoveryError] = useState<string | null>(null);
    const [recoverySuccess, setRecoverySuccess] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === 'true') {
            setShowConfirmed(true);
            window.history.replaceState({}, '', window.location.pathname);
            const t = setTimeout(() => setShowConfirmed(false), 8000);
            return () => clearTimeout(t);
        }
    }, []);

    // Link expired / error state
    const [linkExpired, setLinkExpired] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    // Listen for PASSWORD_RECOVERY event from Supabase
    // IMPORTANT: Only show the recovery form when this event fires,
    // because it guarantees a valid session exists for updateUser().
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('LoginForm auth event:', event, session?.user?.email);
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
                setShowForgot(false);
                setLinkExpired(false);
            }
        });
        // Check URL hash for error params only (expired link, etc.)
        const hash = window.location.hash;
        if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1));

            // Check for errors (expired link, etc.)
            const errorCode = hashParams.get('error_code');
            const errorDesc = hashParams.get('error_description');
            if (errorCode || hashParams.get('error')) {
                if (errorCode === 'otp_expired') {
                    setLinkExpired(true);
                    setLinkError('This password reset link has expired. Please request a new one.');
                } else {
                    setLinkExpired(true);
                    setLinkError(errorDesc?.replace(/\+/g, ' ') || 'This link is invalid or has expired.');
                }
                // Clean up the URL
                window.history.replaceState({}, '', window.location.pathname);
            }
            // NOTE: Do NOT manually set isRecovery from hash params!
            // Wait for the PASSWORD_RECOVERY auth event which guarantees a session.
        }
        return () => subscription.unsubscribe();
    }, []);

    const handleSetNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecoveryError(null);

        if (newPassword.length < 6) {
            setRecoveryError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setRecoveryError('Passwords do not match.');
            return;
        }

        setRecoveryLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setRecoverySuccess(true);
            // Clear URL hash
            window.history.replaceState({}, '', window.location.pathname);
            // After 3s, sign out the recovery session and return to login
            setTimeout(async () => {
                await supabase.auth.signOut();
                setIsRecovery(false);
                setRecoverySuccess(false);
                setNewPassword('');
                setConfirmPassword('');
            }, 3000);
        } catch (err: any) {
            setRecoveryError(err.message || 'Failed to update password');
        } finally {
            setRecoveryLoading(false);
        }
    };

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

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError(null);

        if (!resetEmail.toLowerCase().endsWith('@vsit.edu.in')) {
            setResetError('Only @vsit.edu.in email addresses are allowed.');
            return;
        }

        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (err: any) {
            setResetError(err.message || 'Failed to send reset email');
        } finally {
            setResetLoading(false);
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
                        {linkExpired ? (
                            /* ── Link Expired / Error State ── */
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <Mail className="text-amber-600" size={30} />
                                </div>
                                <h3 className="font-bold text-lg text-[#212529] mb-2">Link Expired</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                    {linkError || 'This password reset link has expired or is invalid.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setLinkExpired(false);
                                        setLinkError(null);
                                        setShowForgot(true);
                                    }}
                                    className="w-full py-3 bg-[#2B5797] text-white rounded-xl font-semibold text-sm hover:bg-[#1e3f6e] transition-colors mb-3"
                                >
                                    Request New Reset Link
                                </button>
                                <button
                                    onClick={() => {
                                        setLinkExpired(false);
                                        setLinkError(null);
                                    }}
                                    className="w-full py-2.5 text-[#2B5797] text-sm font-medium hover:underline"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        ) : isRecovery ? (
                            /* ── Set New Password Form (after clicking reset link) ── */
                            <div>
                                <div className="border-b border-gray-200 mb-6">
                                    <div className="pb-4 font-semibold text-center text-[#2B5797] border-b-2 border-[#2B5797]">
                                        Set New Password
                                    </div>
                                </div>

                                {recoverySuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6"
                                    >
                                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="text-green-600" size={28} />
                                        </div>
                                        <h3 className="font-bold text-lg text-[#212529] mb-1">Password Updated!</h3>
                                        <p className="text-sm text-gray-500">Your password has been changed successfully. Redirecting to login...</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSetNewPassword} className="space-y-5">
                                        <p className="text-sm text-gray-500 text-center mb-4">
                                            Enter your new password below.
                                        </p>

                                        {recoveryError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                                {recoveryError}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">New Password</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></div>
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min 6 characters"
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(p => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2B5797]"
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></div>
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter password"
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2B5797] focus:ring-2 focus:ring-[#2B5797]/10 transition-all"
                                                />
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={recoveryLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                                            className="w-full py-3 bg-[#2B5797] text-white rounded-xl font-semibold text-sm hover:bg-[#1e3f6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {recoveryLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : showForgot ? (
                            /* ── Forgot Password Form ── */
                            <div>
                                <button
                                    onClick={() => { setShowForgot(false); setResetSent(false); setResetError(null); }}
                                    className="flex items-center gap-1.5 text-sm text-[#2B5797] hover:underline font-medium mb-6"
                                >
                                    <ArrowLeft size={14} /> Back to Login
                                </button>

                                <div className="border-b border-gray-200 mb-6">
                                    <div className="pb-4 font-semibold text-center text-[#2B5797] border-b-2 border-[#2B5797]">
                                        Reset Password
                                    </div>
                                </div>

                                {resetSent ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6"
                                    >
                                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Mail size={24} className="text-green-500" />
                                        </div>
                                        <h3 className="font-bold text-[#212529] mb-2">Check your email</h3>
                                        <p className="text-sm text-gray-500 mb-1">
                                            We've sent a password reset link to
                                        </p>
                                        <p className="text-sm font-semibold text-[#2B5797] mb-4">{resetEmail}</p>
                                        <p className="text-xs text-gray-400">
                                            Didn't receive it? Check your spam folder or try again.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        onSubmit={handleForgotPassword}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-5"
                                    >
                                        <p className="text-sm text-gray-500">
                                            Enter your VSIT email address and we'll send you a link to reset your password.
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                VSIT Email ID
                                            </label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="student@vsit.edu.in"
                                                required
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none transition-all"
                                            />
                                        </div>

                                        {resetError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                                            >
                                                {resetError}
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={resetLoading}
                                            className="w-full bg-[#2B5797] text-white py-3 rounded-full font-semibold hover:bg-[#1a3a6e] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {resetLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Sending...
                                                </span>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </div>
                        ) : (
                            /* ── Normal Login Form ── */
                            <>
                                {/* Header */}
                                <div className="border-b border-gray-200 mb-8">
                                    <div className="pb-4 font-semibold text-center text-[#2B5797] border-b-2 border-[#2B5797]">
                                        Login
                                    </div>
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
                                        <button
                                            type="button"
                                            onClick={() => { setShowForgot(true); setResetEmail(email); setResetError(null); setResetSent(false); }}
                                            className="text-sm text-[#2B5797] hover:underline font-medium"
                                        >
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
                            </>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default LoginForm;
