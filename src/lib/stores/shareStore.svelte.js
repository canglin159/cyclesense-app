import { generateKey, exportKey, encryptData } from '$lib/utils/crypto.js';
import { appState } from './appState.svelte.js';

export const shareStore = {
    async createShare() {
        const key = await generateKey();
        const keyStr = await exportKey(key);
        
        const payload = {
            userName: appState.settings.userName,
            nextPeriodStart: appState.prediction.nextPeriodStart,
            fertileWindowStart: appState.prediction.fertileWindowStart,
            fertileWindowEnd: appState.prediction.fertileWindowEnd
        };

        const encrypted = await encryptData(payload, key);

        const response = await fetch('/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encrypted_payload: encrypted.payload,
                iv: encrypted.iv
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create share');
        }

        const { id } = await response.json();
        
        // Return the full link with hash
        const baseUrl = window.location.origin;
        return `${baseUrl}/share/${id}#${keyStr}`;
    }
};
