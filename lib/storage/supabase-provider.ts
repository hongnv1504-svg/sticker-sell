import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProvider } from './types';

export class SupabaseStorageProvider implements StorageProvider {
    private bucket = 'stickers';
    private _supabase: SupabaseClient | null = null;

    private get supabase() {
        if (!this._supabase) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase storage environment variables are missing');
            }

            this._supabase = createClient(supabaseUrl, supabaseServiceKey);
        }
        return this._supabase;
    }

    async upload(path: string, file: Buffer | Blob | string, contentType: string): Promise<string> {
        const { data, error } = await this.supabase.storage
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
        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }

        return data.signedUrl;
    }
}
