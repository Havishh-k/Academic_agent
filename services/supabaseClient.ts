import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'implicit',
        // Bypass navigator.locks API which causes getSession() to hang
        lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
        },
    },
});

export const EDGE_FUNCTION_BASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL || '';
export const AI_COURSE_ID = import.meta.env.VITE_AI_COURSE_ID || import.meta.env.VITE_CS101_COURSE_ID || '';
