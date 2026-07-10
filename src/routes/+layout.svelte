<script>
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { App } from '@capacitor/app';
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { referralStore } from '$lib/stores/referralStore.svelte.js';
    import '$lib/revenuecat-ui.css';

    let { children } = $props();
    let loading = $state(true);

    onMount(async () => {
        await appState.init();
        await premiumStore.init();
        await referralStore.init();
        
        // Handle deep links
        App.addListener('appUrlOpen', data => {
            console.log('App opened with URL:', data.url);
            try {
                const url = new URL(data.url);
                const path = url.pathname;
                if (path) {
                    goto(path);
                }
            } catch (e) {
                console.error('Failed to parse deep link URL', e);
            }
        });

        // Verify Stripe session if returning from checkout
        const urlParams = new URLSearchParams(window.location.search);
        const upgradeStatus = urlParams.get('upgrade');
        const sessionId = urlParams.get('session_id');

        if (upgradeStatus === 'success' && sessionId) {
            await premiumStore.verifyStripeSession(sessionId);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Handle promo code redemption via ?code=CS-GOLD-XXX in URL
        const promoCodeParam = urlParams.get('code');
        if (promoCodeParam) {
            const code = promoCodeParam.trim().toUpperCase();
            const codePrefix = 'CS-GOLD-';
            if (code.startsWith(codePrefix)) {
                const numStr = code.replace(codePrefix, '');
                const num = parseInt(numStr, 10);
                if (!isNaN(num) && num >= 1 && num <= 290) {
                    console.log('Promo code detected via URL:', code);
                    const expiresAt = new Date();
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                    await appState.updateSetting('goldKey', {
                        code,
                        expiresAt: expiresAt.toISOString(),
                        redeemedAt: new Date().toISOString()
                    });
                    console.log('Gold Key activated via URL promo code');
                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        }
        
        // Import web components side-effect using the exported subpath
        await import('@revenuecat/purchases-ui-js/web-components');
        
        loading = false;
    });

    // Track page views
    $effect(() => {
        if (!loading && page.url.pathname) {
            appState.recordEvent('page_view', { path: page.url.pathname });
        }
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>CycleSense | Privacy-First Period & Ovulation Tracker</title>
    <meta name="description" content="CycleSense is a minimalist, privacy-first period and ovulation tracker. No data selling, no accounts, just simple and accurate cycle tracking." />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://cyclesense.app/" />
    <meta property="og:title" content="CycleSense | Privacy-First Period & Ovulation Tracker" />
    <meta property="og:description" content="Minimalist, privacy-first period and ovulation tracker. Secure, simple, and accurate." />
    <meta property="og:image" content="https://cyclesense.app/og-image.png" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://cyclesense.app/" />
    <meta property="twitter:title" content="CycleSense | Privacy-First Period & Ovulation Tracker" />
    <meta property="twitter:description" content="Minimalist, privacy-first period and ovulation tracker. Secure, simple, and accurate." />
    <meta property="twitter:image" content="https://cyclesense.app/og-image.png" />

    <!-- PWA primary color -->
    <meta name="theme-color" content="#fdf4ff" />

    <!-- Google Search Console Verification -->
    <meta name="google-site-verification" content="spLDqxmE712Ew9QRl__0oDL5c0BFyqFpmZ2FeBaXGbA" />

    <!-- JSON-LD for SoftwareApplication -->
    <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CycleSense",
          "operatingSystem": "Web, iOS, Android",
          "applicationCategory": "HealthApplication",
          "description": "CycleSense is a highly accurate, privacy-first period and ovulation tracker. Featuring a minimalist interface, zero-friction onboarding, and local-only data storage for maximum security.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1024"
          },
          "featureList": [
            "Privacy-first cycle tracking",
            "Accurate ovulation prediction",
            "Minimalist, aesthetic interface",
            "No account required",
            "Encrypted partner sharing",
            "Advanced health insights"
          ]
        }
    </script>
</svelte:head>

{#if loading}
    <div class="min-h-screen bg-purple-50 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
{:else}
    {@render children()}
{/if}
