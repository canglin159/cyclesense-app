import { browser } from '$app/environment';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getApiUrl(path) {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If we have an API_BASE_URL, use it
    if (API_BASE_URL) {
        return `${API_BASE_URL}${cleanPath}`;
    }
    
    // Otherwise, use relative path (default for SvelteKit)
    return cleanPath;
}
