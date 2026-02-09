import { SupabaseStorageProvider } from './supabase-provider';
import { StorageProvider } from './types';

export function getStorageProvider(): StorageProvider {
    // For now, only Supabase is implemented
    // We can add logic here to switch between providers based on env vars
    return new SupabaseStorageProvider();
}
