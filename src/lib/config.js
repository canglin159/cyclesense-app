import { browser } from '$app/environment';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cyclesense.app';

export function getApiUrl(path) {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    if (browser && !API_BASE_URL && window.location.origin.includes('localhost')) {
         // During development, we might want to proxy or use local
         return cleanPath;
    }

    return `${API_BASE_URL}${cleanPath}`;
}
