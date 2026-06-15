import { Purchases } from '@revenuecat/purchases-js';
import { appState } from './appState.svelte.js';
import { getApiUrl } from '../config.js';

class PremiumStore {
    isPremium = $state(false);
    entitlements = $state([]);
    offerings = $state(null);
    loading = $state(false);
    customerInfo = $state(null);
    purchases = null;

    async init() {
        if (typeof window === 'undefined') return;
        this.loading = true;
        try {
            // Use API key from environment or instructions
            const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'test_EDGjbjRieknNNBBCIpnixQkEAai';
            
            // Configure RevenueCat and store the instance
            this.purchases = Purchases.configure({ 
                apiKey, 
                appUserId: appState.settings.userId 
            });

            // Initial check
            await this.refreshStatus();

            // Get offerings for the upgrade screen
            const offerings = await this.purchases.getOfferings();
            this.offerings = offerings.current;
        } catch (e) {
            console.error('Failed to initialize RevenueCat', e);
        } finally {
            this.loading = false;
        }
    }

    async refreshStatus() {
        if (!this.purchases) return;
        try {
            const info = await this.purchases.getCustomerInfo();
            this.updateFromCustomerInfo(info);
        } catch (e) {
            console.error('Failed to refresh customer info', e);
        }
    }

    updateFromCustomerInfo(info) {
        this.customerInfo = info;
        // The task specifies "Cyclesense Pro" as the entitlement to check
        if (info.entitlements.active['Cyclesense Pro'] || info.entitlements.active['premium']) {
            this.isPremium = true;
            this.entitlements = Object.keys(info.entitlements.active);
        } else {
            this.isPremium = false;
            this.entitlements = [];
        }
    }

    async upgrade(priceId) {
        if (!this.purchases) return;
        // Fallback for manual Stripe flow if needed, but modern best practice
        // is to use RevenueCat Paywalls or makePurchase
        try {
            // If priceId is a RevenueCat Package/Product ID
            await this.purchases.purchaseProduct(priceId);
            await this.refreshStatus();
        } catch (e) {
            console.error('Purchase failed', e);
            // Fallback to legacy stripe checkout if needed
            const response = await fetch(getApiUrl('/api/create-checkout-session'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: appState.settings.userId,
                    successUrl: window.location.origin + '/?upgrade=success&session_id={CHECKOUT_SESSION_ID}',
                    cancelUrl: window.location.origin + '/?upgrade=cancelled'
                })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to start checkout');
            }
        }
    }

    async verifyStripeSession(sessionId) {
        const response = await fetch(getApiUrl('/api/verify-session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        const result = await response.json();
        if (result.success) {
            await this.refreshStatus();
            return true;
        }
        return false;
    }
}

export const premiumStore = new PremiumStore();
