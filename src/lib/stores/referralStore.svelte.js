import { appState } from './appState.svelte.js';
import { premiumStore } from './premiumStore.svelte.js';
import { getApiUrl } from '../config.js';

class ReferralStore {
    referralStatus = $state('idle'); // idle, processing, success, error
    referredBy = $state(null);
    creditsEarned = $state(0); // number of months
    referralHistory = $state([]);

    async init() {
        if (typeof window === 'undefined') return;

        // 1. Check for ?ref= in URL
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref && ref !== appState.settings.referralId) {
            console.log('Detected referral code:', ref);
            await appState.updateSetting('referredBy', ref);
            this.referredBy = ref;
        } else {
            this.referredBy = appState.settings.referredBy;
        }

        // TODO: Fetch referral history/credits from a backend if we had one.
        // For MVP, we might just rely on entitlements granted in RevenueCat.
    }

    async activateReferral() {
        if (!this.referredBy || this.referralStatus === 'success' || appState.settings.referralActivated) return;

        this.referralStatus = 'processing';
        try {
            const response = await fetch(getApiUrl('/api/referral/activate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: appState.settings.userId,
                    referredBy: this.referredBy
                })
            });

            const result = await response.json();
            if (result.success) {
                this.referralStatus = 'success';
                await appState.updateSetting('referralActivated', true);
                // Refresh premium status since we might have just gotten a month of Pro
                await premiumStore.refreshStatus();
            } else {
                this.referralStatus = 'error';
                console.error('Referral activation failed:', result.error);
            }
        } catch (e) {
            this.referralStatus = 'error';
            console.error('Referral activation error:', e);
        }
    }

    get referralLink() {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/?ref=${appState.settings.referralId}`;
    }

    get referralMessage() {
        return `I’ve switched to a period tracker that actually respects my privacy. No accounts, no ads, and it’s local-first. Use my link to get a free month of Premium: ${this.referralLink}`;
    }
}

export const referralStore = new ReferralStore();
