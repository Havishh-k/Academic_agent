import React, { useState, useCallback } from 'react';
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
            supabase.from('subjects').select('id, subject_name, subject_code')
                .then(({ data }) => {
                    if (data) setAvailableSubjects(data);
                });
        }
    }, [role]);

    // Cooldown timer
    React.useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
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
            const extra = role === 'student'
                ? { studentId, department, year, semester }
                : { facultyId, department, designation, subjectId };
            const result = await onSignup(email, password, fullName, role, extra);

            if (result.needsConfirmation) {
                setShowConfirmation(true);
                setResendCooldown(60);
            }
            // If no confirmation needed, AuthContext already signed in
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

    // ─── EMAIL CONFIRMATION SUCCESS VIEW ───
    if (showConfirmation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academic-50 via-white to-blue-50 px-4 py-8">
                <div className="w-full max-w-md text-center">
                    {/* Animated sparkle wrapper */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                        <div style={{
                            width: 96, height: 96, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)',
                            animation: 'confirmPulse 2s ease-in-out infinite',
                        }}>
                            <span style={{ fontSize: 48 }}>✉️</span>
                        </div>
                        {/* Sparkle dots */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                width: 8, height: 8, borderRadius: '50%',
                                background: ['#F59E0B', '#8B5CF6', '#3B82F6', '#EF4444', '#10B981', '#EC4899'][i],
                                top: `${[10, 5, 30, 70, 85, 60][i]}%`,
                                left: `${[-10, 50, 110, 115, 80, -15][i]}%`,
                                animation: `sparkle ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
                                opacity: 0.7,
                            }} />
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl shadow-academic-100/50 border border-academic-100 p-8">
                        <h2 className="text-2xl font-serif font-bold text-academic-900 mb-2">
                            Check Your Email! 📬
                        </h2>
                        <p className="text-academic-500 text-sm mb-6">
                            We've sent a confirmation link to
                        </p>
                        <p className="text-lg font-semibold text-academic-800 bg-academic-50 rounded-xl px-4 py-2 mb-6">
                            {email}
                        </p>
                        <p className="text-sm text-academic-400 mb-6">
                            Click the link in your email to activate your academic account.
                            Check your spam folder if you don't see it.
                        </p>

                        {/* Resend button with cooldown */}
                        <button
                            onClick={handleResendEmail}
                            disabled={resendCooldown > 0}
                            className="w-full py-3 rounded-xl border border-academic-200 text-academic-700 font-semibold text-sm hover:bg-academic-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        >
                            {resendCooldown > 0
                                ? `Resend email in ${resendCooldown}s`
                                : '🔄 Resend Confirmation Email'}
                        </button>

                        <button
                            onClick={onSwitchToLogin}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-academic-600 to-academic-800 text-white font-semibold text-sm shadow-lg shadow-academic-200 hover:shadow-xl transition-all"
                        >
                            Go to Sign In →
                        </button>

                        {error && (
                            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Inline animations */}
                    <style>{`
                        @keyframes confirmPulse {
                            0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(16,185,129,0.35); }
                            50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(16,185,129,0.5); }
                        }
                        @keyframes sparkle {
                            0% { transform: scale(0.5) translateY(0); opacity: 0.3; }
                            100% { transform: scale(1.2) translateY(-8px); opacity: 1; }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // ─── SIGNUP FORM ───
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academic-50 via-white to-blue-50 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-academic-600 to-academic-800 text-white mb-4 shadow-lg shadow-academic-200">
                        <span className="text-2xl font-serif font-bold">AI</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-academic-900 tracking-tight">Create Account</h1>
                    <p className="text-academic-500 text-sm mt-1">Join the academic learning platform</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-academic-100/50 border border-academic-100 p-8" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selector */}
                        <div className="flex gap-2 p-1 rounded-xl bg-academic-100">
                            {(['student', 'faculty'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === r
                                        ? 'bg-white text-academic-900 shadow-sm'
                                        : 'text-academic-500 hover:text-academic-700'
                                        }`}
                                >
                                    {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-academic-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-academic-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@vsit.edu.in"
                                pattern=".+@vsit\.edu\.in$"
                                title="Only @vsit.edu.in emails are allowed"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-academic-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                            />
                        </div>

                        {/* Role-specific fields */}
                        {role === 'student' ? (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Student ID</label>
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            placeholder="STU001"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        >
                                            <option>Computer Science</option>
                                            <option>Mathematics</option>
                                            <option>Physics</option>
                                            <option>Engineering</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Year</label>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        >
                                            {[1, 2, 3, 4].map((y) => (
                                                <option key={y} value={y}>Year {y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Semester</label>
                                        <select
                                            value={semester}
                                            onChange={(e) => setSemester(Number(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                <option key={s} value={s}>Sem {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Faculty ID</label>
                                        <input
                                            type="text"
                                            value={facultyId}
                                            onChange={(e) => setFacultyId(e.target.value)}
                                            placeholder="FAC001"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-academic-700 mb-1">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                        >
                                            <option>Computer Science</option>
                                            <option>Mathematics</option>
                                            <option>Physics</option>
                                            <option>Engineering</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-academic-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        placeholder="Assistant Professor"
                                        className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 placeholder:text-academic-300 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-academic-700 mb-1">Teaching Subject</label>
                                    <select
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-academic-200 text-academic-900 focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent bg-academic-50/50"
                                    >
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
                            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-academic-600 to-academic-800 text-white font-semibold text-sm shadow-lg shadow-academic-200 hover:shadow-xl hover:shadow-academic-300 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : `Sign Up as ${role === 'student' ? 'Student' : 'Faculty'}`}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-academic-500">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="font-semibold text-academic-700 hover:text-academic-900 underline underline-offset-2 transition-colors"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
