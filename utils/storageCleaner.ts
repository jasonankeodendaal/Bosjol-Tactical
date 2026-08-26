import { supabase, isSupabaseConfigured } from '../supabaseClient';

/**
 * Parses a Supabase storage URL to extract the bucket name and the object path inside the bucket.
 */
export function parseSupabaseStorageUrl(url: string): { bucket: string; path: string } | null {
    if (!url || typeof url !== 'string') return null;

    try {
        // Pattern 1: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        // Pattern 2: https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>?...
        // Pattern 3: /storage/v1/object/public/<bucket>/<path>
        const match = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/);
        if (match && match[1] && match[2]) {
            return {
                bucket: decodeURIComponent(match[1]),
                path: decodeURIComponent(match[2])
            };
        }

        // Pattern 4: Direct supabase bucket references formatted as bucket:path or bucket/path
        if (url.startsWith('sb://')) {
            const parts = url.replace('sb://', '').split('/');
            if (parts.length >= 2) {
                return {
                    bucket: parts[0],
                    path: parts.slice(1).join('/')
                };
            }
        }
    } catch (err) {
        console.warn('Error parsing storage URL:', url, err);
    }

    return null;
}

/**
 * Removes a file or list of files from Supabase storage buckets to free up project storage and egress.
 */
export async function deleteFromSupabaseStorage(urlOrUrls: string | string[] | undefined | null): Promise<void> {
    if (!urlOrUrls || !isSupabaseConfigured() || !supabase) return;

    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const groupedByBucket: Record<string, string[]> = {};

    for (const rawUrl of urls) {
        if (!rawUrl) continue;
        const parsed = parseSupabaseStorageUrl(rawUrl);
        if (parsed) {
            if (!groupedByBucket[parsed.bucket]) {
                groupedByBucket[parsed.bucket] = [];
            }
            groupedByBucket[parsed.bucket].push(parsed.path);
        }
    }

    for (const [bucket, paths] of Object.entries(groupedByBucket)) {
        if (paths.length === 0) continue;
        try {
            const { error } = await supabase.storage.from(bucket).remove(paths);
            if (error) {
                console.warn(`[StorageCleaner] Failed to remove ${paths.length} file(s) from bucket '${bucket}':`, error.message);
            } else {
                console.info(`[StorageCleaner] Successfully deleted ${paths.length} file(s) from Supabase bucket '${bucket}' to free storage space.`);
            }
        } catch (e: any) {
            console.warn(`[StorageCleaner] Network error deleting files from bucket '${bucket}':`, e?.message || e);
        }
    }
}

/**
 * Recursively scans any object or document to find image/media URLs and deletes them from Supabase storage.
 */
export async function extractAndCleanStorageUrlsFromDoc(doc: any): Promise<void> {
    if (!doc || typeof doc !== 'object') return;

    const urlsToClean: string[] = [];

    function scan(val: any) {
        if (!val) return;
        if (typeof val === 'string') {
            if (val.includes('/storage/v1/object/') || val.startsWith('sb://')) {
                urlsToClean.push(val);
            }
        } else if (Array.isArray(val)) {
            val.forEach(item => scan(item));
        } else if (typeof val === 'object') {
            Object.values(val).forEach(child => scan(child));
        }
    }

    scan(doc);

    if (urlsToClean.length > 0) {
        await deleteFromSupabaseStorage(urlsToClean);
    }
}
