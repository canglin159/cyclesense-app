import { appState } from './appState.svelte.js';
import { getApiUrl } from '../config.js';

/**
 * Platform-aware premium store.
 * - On native Android (Capacitor): uses @revenuecat/purchases-capacitor for Google Play Billing
 * - On web/PWA: uses @revenuecat/purchases-js for Stripe via RevenueCat
 * 
 * The isNative flag is set during init() by checking Capacitor platform.
 */
class PremiumStore {
    subscriptionActive = $state(false);
    isPremium = $derived(this.subscriptionActive || appState.isPremium);
    entitlements = $state([]);
    offerings = $state(null);
    loading = $state(false);
    customerInfo = $state(null);
    purchasesJS = null;       // Web SDK instance (@revenuecat/purchases-js)
    purchasesNative = null;   // Native Capacitor plugin (@revenuecat/purchases-capacitor)
    isNativePlatform = false; // True when running as native Android/iOS app
    apiKey = '';

    async init() {
        if (typeof window === 'undefined') return;
        this.loading = true;
        try {
            this.apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'test_EDGjbjRieknNNBBCIpnixQkEAai';

            // Detect native platform via Capacitor
            const { Capacitor } = await import('@capacitor/core');
            this.isNativePlatform = Capacitor.isNativePlatform();

            if (this.isNativePlatform) {
                // Use native Capacitor plugin (bridges Google Play Billing on Android)
                const { Purchases } = await import('@revenuecat/purchases-capacitor');
                this.purchasesNative = Purchases;

                await this.purchasesNative.configure({
                    apiKey: this.apiKey,
                    appUserID: appState.settings.userId
                });

                // Check existing entitlements
                const info = await this.purchasesNative.getCustomerInfo();
                this.updateFromCustomerInfo(info);
            } else {
                // Use web JS SDK (Stripe via RevenueCat)
                const { Purchases } = await import('@revenuecat/purchases-js');
                this.purchasesJS = Purchases.configure({
                    apiKey: this.apiKey,
                    appUserId: appState.settings.userId
                });

                await this.refreshStatus();

                // Get offerings for the upgrade screen
                const offerings = await this.purchasesJS.getOfferings();
                this.offerings = offerings.current;
            }
        } catch (e) {
            console.error('Failed to initialize premium store', e);
        } finally {
            this.loading = false;
        }
    }

    async refreshStatus() {
        if (!this.purchasesJS && !this.purchasesNative) return;
        try {
            if (this.isNativePlatform && this.purchasesNative) {
                const info = await this.purchasesNative.getCustomerInfo();
                this.updateFromCustomerInfo(info);
            } else if (this.purchasesJS) {
                const info = await this.purchasesJS.getCustomerInfo();
                this.updateFromCustomerInfo(info);
            }
        } catch (e) {
            console.error('Failed to refresh customer info', e);
        }
    }

    updateFromCustomerInfo(info) {
        this.customerInfo = info;
        if (info.entitlements.active['Cyclesense Pro'] || info.entitlements.active['premium'] || info.entitlements.active['gold_key']) {
            this.subscriptionActive = true;
            this.entitlements = Object.keys(info.entitlements.active);
        } else {
            this.subscriptionActive = false;
            this.entitlements = [];
        }
    }

    /**
     * Purchase a product. On native Android, uses Google Play Billing.
     * On web/PWA, falls back to Stripe checkout via server-side session.
     */
    async purchaseProduct(identifier) {
        try {
            if (this.isNativePlatform && this.purchasesNative) {
                // Google Play Billing via RevenueCat Capacitor plugin
                const result = await this.purchasesNative.purchaseProduct({
                    productIdentifier: identifier,
                    // Optional: type: 'subs'
                });
                await this.refreshStatus();
                return result;
            } else if (this.purchasesJS) {
                // Web: use Stripe checkout via server session
                await this.handleStripePurchase(identifier);
            }
        } catch (e) {
            console.error('Purchase failed', e);
            // Fallback: Stripe checkout
            await this.handleStripePurchase(identifier);
        }
    }

    async purchasePackage(pkg) {
        try {
            if (this.isNativePlatform && this.purchasesNative) {
                const { Purchases } = await import('@revenuecat/purchases-capacitor');
                const result = await Purchases.purchasePackage({ aPackage: pkg });
                await this.refreshStatus();
                return result;
            } else if (this.purchasesJS) {
                // Fallback: use product identifier from package
                await this.handleStripePurchase(pkg.product.identifier);
            }
        } catch (e) {
            console.error('Package purchase failed', e);
            await this.handleStripePurchase(pkg.product.identifier);
        }
    }

    async handleStripePurchase(productId) {
        const response = await fetch(getApiUrl('/api/create-checkout-session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId: productId,
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

    /**
     * Restore purchases (works on native, triggers receipt refresh on web)
     */
    async restorePurchases() {
        try {
            if (this.isNativePlatform && this.purchasesNative) {
                const info = await this.purchasesNative.restorePurchases();
                this.updateFromCustomerInfo(info);
                return info;
            } else if (this.purchasesJS) {
                await this.refreshStatus();
                return this.customerInfo;
            }
        } catch (e) {
            console.error('Restore failed', e);
        }
    }
}

export const premiumStore = new PremiumStore();