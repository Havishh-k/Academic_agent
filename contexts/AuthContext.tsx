import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthService, AuthUser } from '../services/authService';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        fullName: string,
        role: 'student' | 'faculty',
        extra?: any
    ) => Promise<{ needsConfirmation: boolean }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => ({ needsConfirmation: false }),
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to load profile with error handling
    const loadProfile = async (userId: string): Promise<AuthUser | null> => {
        try {
            return await AuthService.getProfile(userId);
        } catch (err) {
            console.error('Failed to load profile:', err);
            return null;
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('getSession:', session ? session.user.email : 'no session', error || '');

                if (session?.user && mounted) {
                    const profile = await loadProfile(session.user.id);
                    if (mounted) setUser(profile);
                }
            } catch (err) {
                console.error('getSession error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        init();

        // Listen for auth changes (sign in / sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;
                console.log('Auth event:', event, session?.user?.email);

                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await loadProfile(session.user.id);
                    if (mounted) {
                        setUser(profile);
                        setLoading(false);
                    }
                } else if (event === 'SIGNED_OUT') {
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        // AuthService.signIn triggers onAuthStateChange(SIGNED_IN)
        // which will call loadProfile automatically
        const { user: authUser } = await AuthService.signIn(email, password);
        // Also set profile directly for immediate UI update
        if (authUser) {
            const profile = await loadProfile(authUser.id);
            setUser(profile);
        }
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        role: 'student' | 'faculty',
        extra?: any
    ): Promise<{ needsConfirmation: boolean }> => {
        const result = await AuthService.signUp(email, password, fullName, role, extra);

        if (result.needsConfirmation) {
            // Don't auto-sign-in — the user must confirm email first
            return { needsConfirmation: true };
        }

        // If auto-confirm is enabled (no email confirmation), sign in directly
        await signIn(email, password);
        return { needsConfirmation: false };
    };

    const signOut = async () => {
        await AuthService.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
