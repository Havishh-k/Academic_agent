import { supabase } from './supabaseClient';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'faculty' | 'admin';
    prefers_voice?: boolean;
}

export interface StudentInfo {
    id: string;
    student_id: string;
    department: string | null;
    year: number | null;
    semester: number | null;
}

export interface FacultyInfo {
    id: string;
    faculty_id: string;
    department: string | null;
    designation: string | null;
}

export interface AuthUser {
    profile: UserProfile;
    student?: StudentInfo;
    faculty?: FacultyInfo;
}

export class AuthService {
    static async signUp(
        email: string,
        password: string,
        fullName: string,
        role: 'student' | 'faculty',
        extra?: {
            studentId?: string;
            department?: string;
            year?: number;
            semester?: number;
            facultyId?: string;
            designation?: string;
            subjectId?: string;
        }
    ) {
        // Enforce @vsit.edu.in domain
        if (!email.toLowerCase().endsWith('@vsit.edu.in')) {
            throw new Error('Only @vsit.edu.in email addresses are allowed.');
        }

        // Pass ALL data in metadata — the DB trigger creates
        // profile + student/faculty records with SECURITY DEFINER
        const metadata: Record<string, any> = {
            full_name: fullName,
            role: role,
        };

        if (role === 'student') {
            metadata.student_id = extra?.studentId || '';
            metadata.department = extra?.department || '';
            metadata.year = extra?.year || 1;
            metadata.semester = extra?.semester || 1;
        } else if (role === 'faculty') {
            metadata.faculty_id = extra?.facultyId || '';
            metadata.department = extra?.department || '';
            metadata.designation = extra?.designation || '';
            metadata.subject_id = extra?.subjectId || '';
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Signup failed');

        // If email confirmation is required, user.identities will be empty
        const needsConfirmation =
            data.user.identities?.length === 0 ||
            data.user.confirmation_sent_at != null;

        return { ...data, needsConfirmation };
    }

    static async signIn(email: string, password: string) {
        // Enforce @vsit.edu.in domain
        if (!email.toLowerCase().endsWith('@vsit.edu.in')) {
            throw new Error('Only @vsit.edu.in email addresses are allowed.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    static async signOut() {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch {
            // Even if network fails, clear local session
            console.warn('signOut network error — clearing local session anyway');
        }
    }

    static async getProfile(userId: string): Promise<AuthUser | null> {
        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) return null;

        const authUser: AuthUser = { profile };

        // Get role-specific data
        if (profile.role === 'student') {
            const { data: student } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (student) authUser.student = student;
        } else if (profile.role === 'faculty') {
            const { data: faculty } = await supabase
                .from('faculty')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (faculty) authUser.faculty = faculty;
        }

        return authUser;
    }

    static async getUserSubjects(userId: string, role: 'student' | 'faculty') {
        if (role === 'student') {
            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (!student) return [];

            const { data } = await supabase
                .from('student_enrollments')
                .select('subject_id, academic_year, subjects(*)')
                .eq('student_id', student.id);
            return data || [];
        } else {
            const { data: faculty } = await supabase
                .from('faculty')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (!faculty) return [];

            const { data } = await supabase
                .from('faculty_subjects')
                .select('subject_id, academic_year, subjects(*)')
                .eq('faculty_id', faculty.id);
            return data || [];
        }
    }
}
