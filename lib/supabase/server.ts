import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin() {
    if (!supabaseAdminInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase admin environment variables are missing');
        }

        supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
    }
    return supabaseAdminInstance;
}

// Keep export for backward compatibility but it will be a proxy
export const supabaseAdmin = (function () {
    return new Proxy({} as SupabaseClient, {
        get(_, prop) {
            return (getSupabaseAdmin() as any)[prop];
        }
    });
})();
