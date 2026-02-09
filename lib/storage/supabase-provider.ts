import { createClient } from '@supabase/supabase-js';
import { StorageProvider } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key to bypass RLS for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorageProvider implements StorageProvider {
    private bucket = 'stickers';

    async upload(path: string, file: Buffer | Blob | string, contentType: string): Promise<string> {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .upload(path, file, {
                contentType,
                upsert: true,
            });

        if (error) {
            throw new Error(`Failed to upload to Supabase: ${error.message}`);
        }

        return data.path;
    }

    async getSignedUrl(path: string, expiresIn: number = 172800): Promise<string> {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }

        return data.signedUrl;
    }
}
