import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Mic, ShieldCheck, Clock, Smartphone } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface SignupFormProps {
    onSwitchToLogin: () => void;
    onSignup: (
        email: string,
        password: string,
        fullName: string,
        role: 'student' | 'faculty',
        extra: any
    ) => Promise<{ needsConfirmation: boolean }>;
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

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [studentId, setStudentId] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [department, setDepartment] = useState('Computer Science');
    const [designation, setDesignation] = useState('');
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [subjectId, setSubjectId] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState<{ id: string; subject_name: string; subject_code: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ── Email Confirmation State ──
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Fetch subjects when role switches to faculty
    React.useEffect(() => {
        if (role === 'faculty') {
            supabase
                .from('subjects')
                .select('id, subject_name, subject_code')
                .then(({ data }) => {
                    if (data) setAvailableSubjects(data);
                });
        }
    }, [role]);

    // Cooldown timer
    React.useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.toLowerCase().endsWith('@vsit.edu.in')) {
            setError('Only @vsit.edu.in email addresses are allowed.');
            return;
        }

        if (role === 'faculty' && !subjectId) {
            setError('Please select a subject to teach.');
            return;
        }

        setLoading(true);
        try {
            const extra =
                role === 'student'
                    ? { studentId, department, year, semester }
                    : { facultyId, department, designation, subjectId };
            const result = await onSignup(email, password, fullName, role, extra);

            if (result.needsConfirmation) {
                setShowConfirmation(true);
                setResendCooldown(60);
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = useCallback(async () => {
        if (resendCooldown > 0) return;
        try {
            const { error: resendErr } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
                },
            });
            if (resendErr) throw resendErr;
            setResendCooldown(60);
        } catch (err: any) {
            setError(err.message || 'Failed to resend email');
        }
    }, [email, resendCooldown]);

    /* ─── INPUT STYLE CONSTANTS ─── */
    const inputCls =
        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] focus:border-transparent outline-none transition-all bg-white text-[#212529]';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

    /* ─── EMAIL CONFIRMATION VIEW ─── */
    if (showConfirmation) {
        return (
            <div className="flex min-h-screen bg-[#F8F9FA]">
                {/* Left panel */}
                <div className="hidden lg:flex w-[42%] bg-white flex-col justify-between p-10 xl:p-12 border-r border-gray-200">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                                VSIT
                            </div>
                            <h1 className="text-xl xl:text-2xl font-bold text-[#2B5797]">VSIT AI Academic Agent</h1>
                        </div>
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-bold inline-block mb-10">
                            RE-ACCREDITED: GRADE 'A' BY NAAC
                        </div>
                        <FeatureItem icon={BookOpen} title="AI Academic Agent" desc="Personalized learning companion powered by AI" />
                        <FeatureItem icon={CheckCircle} title="Real-time Performance Tracking" desc="Know your strengths and improve weak areas" />
                        <FeatureItem icon={Mic} title="Voice-First Interaction" desc="Accessible for all users with VIP mode" />
                        <FeatureItem icon={ShieldCheck} title="Faculty-Approved Content" desc="All notes vetted by department faculty" />
                        <FeatureItem icon={Clock} title="Secure Authentication" desc="Enhanced security with email verification" />
                        <FeatureItem icon={Smartphone} title="Multi-Device Support" desc="Learn anywhere, anytime" />
                    </div>
                    <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">© 2026 Vidyalankar School of Information Technology</div>
                </div>

                {/* Confirmation panel */}
                <div className="flex-1 flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">✉️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#212529] mb-2">Check Your Email! 📬</h2>
                        <p className="text-gray-500 text-sm mb-4">We've sent a confirmation link to</p>
                        <p className="text-base font-semibold text-[#2B5797] bg-blue-50 rounded-lg px-4 py-2 mb-6">{email}</p>
                        <p className="text-sm text-gray-400 mb-6">Click the link in your email to activate your academic account. Check your spam folder if you don't see it.</p>

                        <button
                            onClick={handleResendEmail}
                            disabled={resendCooldown > 0}
                            className="w-full py-3 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        >
                            {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : '🔄 Resend Confirmation Email'}
                        </button>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-full py-3 rounded-full bg-[#2B5797] text-white font-semibold text-sm hover:bg-[#1a3a6e] transition-colors shadow-md"
                        >
                            Go to Sign In →
                        </button>

                        {error && (
                            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ─── SIGNUP FORM ─── */
    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* ─── Left Column · Feature Panel ─── */}
            <div className="hidden lg:flex w-[42%] bg-white flex-col justify-between p-10 xl:p-12 border-r border-gray-200">
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            VSIT
                        </div>
                        <h1 className="text-xl xl:text-2xl font-bold text-[#2B5797]">VSIT AI Academic Agent</h1>
                    </div>
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-bold inline-block mb-10">
                        RE-ACCREDITED: GRADE 'A' BY NAAC
                    </div>
                    <FeatureItem icon={BookOpen} title="AI Academic Agent" desc="Personalized learning companion powered by AI" />
                    <FeatureItem icon={CheckCircle} title="Real-time Performance Tracking" desc="Know your strengths and improve weak areas" />
                    <FeatureItem icon={Mic} title="Voice-First Interaction" desc="Accessible for all users with VIP mode" />
                    <FeatureItem icon={ShieldCheck} title="Faculty-Approved Content" desc="All notes vetted by department faculty" />
                    <FeatureItem icon={Clock} title="Secure Authentication" desc="Enhanced security with email verification" />
                    <FeatureItem icon={Smartphone} title="Multi-Device Support" desc="Learn anywhere, anytime" />
                </div>
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">© 2026 Vidyalankar School of Information Technology</div>
            </div>

            {/* ─── Right Column · Registration Form ─── */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-[480px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 bg-[#2B5797] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            VSIT
                        </div>
                        <h1 className="text-xl font-bold text-[#2B5797]">VSIT AI Academic Agent</h1>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        {/* Tab Header */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={onSwitchToLogin}
                                className="flex-1 pb-4 font-semibold text-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Login
                            </button>
                            <button className="flex-1 pb-4 font-semibold text-center text-[#2B5797] border-b-2 border-[#2B5797]">
                                Register
                            </button>
                        </div>

                        {/* Role Selector */}
                        <div className="flex gap-2 p-1 rounded-lg bg-gray-100 mb-6">
                            {(['student', 'faculty'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${role === r
                                            ? 'bg-white text-[#2B5797] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                                </button>
                            ))}
                        </div>

                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                            style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}
                        >
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Email (@vsit.edu.in)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@vsit.edu.in"
                                    pattern=".+@vsit\.edu\.in$"
                                    title="Only @vsit.edu.in emails are allowed"
                                    required
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                    minLength={6}
                                    className={inputCls}
                                />
                            </div>

                            {/* Role-specific fields */}
                            {role === 'student' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Student ID</label>
                                            <input
                                                type="text"
                                                value={studentId}
                                                onChange={(e) => setStudentId(e.target.value)}
                                                placeholder="STU001"
                                                required
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Department</label>
                                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                                                <option>Computer Science</option>
                                                <option>IT</option>
                                                <option>Data Science</option>
                                                <option>AIDS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Year</label>
                                            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls}>
                                                {[1, 2, 3, 4].map((y) => (
                                                    <option key={y} value={y}>
                                                        Year {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Semester</label>
                                            <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className={inputCls}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                    <option key={s} value={s}>
                                                        Sem {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Faculty ID</label>
                                            <input
                                                type="text"
                                                value={facultyId}
                                                onChange={(e) => setFacultyId(e.target.value)}
                                                placeholder="FAC001"
                                                required
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Department</label>
                                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                                                <option>Computer Science</option>
                                                <option>IT</option>
                                                <option>Data Science</option>
                                                <option>AIDS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Designation</label>
                                        <input
                                            type="text"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            placeholder="Assistant Professor"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Teaching Subject</label>
                                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required className={inputCls}>
                                            <option value="">Select a subject...</option>
                                            {availableSubjects.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.subject_name} ({s.subject_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

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
                                className="w-full bg-[#2B5797] text-white py-3 rounded-full font-semibold hover:bg-[#1a3a6e] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </motion.form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <button onClick={onSwitchToLogin} className="font-semibold text-[#2B5797] hover:underline transition-colors">
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
