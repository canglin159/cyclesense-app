<script>
    import { onMount } from 'svelte';
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { goto } from '$app/navigation';
    import { fade, scale, slide } from 'svelte/transition';
    import { 
        ShieldCheck, Sparkles, Zap, Lock, Heart, 
        ChevronRight, Star, Check, Smartphone, ExternalLink, ArrowRight
    } from '@lucide/svelte';

    let promoCode = $state('');
    let promoLoading = $state(false);
    let promoError = $state('');
    let promoSuccess = $state('');
    let showPromoInput = $state(false);
    let loading = $state(true);

    const features = [
        { icon: ShieldCheck, title: 'Zero Data Collection', desc: 'All health data stays on your device. No servers, no accounts, no data brokers. Ever.' },
        { icon: Zap, title: 'Accurate Predictions', desc: 'AI-powered cycle forecasting with 95%+ accuracy. Predicts periods, ovulation, and fertile windows.' },
        { icon: Lock, title: 'Subpoena-Proof', desc: 'No cloud sync means no data to subpoena. Your private health data is truly yours alone.' },
        { icon: Smartphone, title: 'Works Everywhere', desc: 'PWA on web, Android app on Google Play, and iOS coming soon. Your data syncs across none of them.' },
    ];

    const VALID_CODE_PREFIX = 'CS-GOLD-';

    onMount(async () => {
        await appState.init();
        await premiumStore.init();
        loading = false;
    });

    function isCodeValid(code) {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed.startsWith(VALID_CODE_PREFIX)) return false;
        const numStr = trimmed.replace(VALID_CODE_PREFIX, '');
        const num = parseInt(numStr, 10);
        if (isNaN(num)) return false;
        return num >= 1 && num <= 290;
    }

    async function handlePromoRedemption() {
        promoError = '';
        promoSuccess = '';
        if (!promoCode.trim()) { promoError = 'Please enter a promo code'; return; }
        if (!isCodeValid(promoCode)) { promoError = 'Invalid promo code. Valid format: CS-GOLD-XXX (001-290)'; return; }
        promoLoading = true;
        try {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            await appState.updateSetting('goldKey', {
                code: promoCode.trim().toUpperCase(),
                expiresAt: expiresAt.toISOString(),
                redeemedAt: new Date().toISOString()
            });
            await premiumStore.refreshStatus();
            promoSuccess = '🎉 Gold Key activated! You now have premium access for 1 year.';
            setTimeout(() => { goto('/app'); }, 1500);
        } catch (e) {
            promoError = 'Failed to redeem code. Please try again.';
        } finally { promoLoading = false; }
    }

    function handleGoldKeyPurchase() {
        window.location.href = 'https://buy.stripe.com/4gM00jg3f3OxeFk2to0ZW07';
    }

    function enterApp() {
        goto('/app');
    }
</script>

{#if loading}
    <div class="min-h-screen bg-purple-50 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
{:else}
    <!-- Hero Section -->
    <div class="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
        <!-- Navigation -->
        <nav class="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <Heart class="w-5 h-5 text-white fill-white" />
                </div>
                <span class="text-lg font-black text-gray-900 tracking-tight">CycleSense</span>
            </div>
            <div class="flex items-center gap-3">
                <button onclick={enterApp}
                    class="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">
                    Sign In
                </button>
                <button onclick={handleGoldKeyPurchase}
                    class="bg-purple-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-200 flex items-center gap-1.5">
                    <Sparkles class="w-4 h-4" /> Get Gold Key
                </button>
            </div>
        </nav>

        <!-- Hero -->
        <section class="px-6 pt-16 pb-20 max-w-5xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 mb-8">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="text-xs font-bold text-purple-600 uppercase tracking-wider">No servers. No accounts. No data collection.</span>
            </div>
            
            <h1 class="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                Private Period &<br />
                Ovulation Tracking
            </h1>
            <p class="text-xl text-gray-500 font-medium mb-4 max-w-xl mx-auto leading-relaxed">
                <span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-bold">Zero data collection.</span>
                Period.
            </p>
            <p class="text-base text-gray-400 mb-10 max-w-lg mx-auto">
                The only period tracker that stores everything on your device. No accounts, no cloud, no data brokers. Just accurate cycle predictions and complete privacy.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button onclick={handleGoldKeyPurchase}
                    class="bg-purple-600 text-white text-lg font-black px-8 py-4 rounded-[20px] hover:bg-purple-700 active:scale-95 transition-all shadow-xl shadow-purple-200/50 flex items-center gap-2">
                    <Sparkles class="w-5 h-5" /> Buy Gold Key — $19.99/yr
                    <ArrowRight class="w-5 h-5" />
                </button>
                <button onclick={enterApp}
                    class="text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors underline underline-offset-4">
                    Already a member? Enter the app →
                </button>
            </div>

            <!-- Promo Code -->
            <div class="max-w-sm mx-auto">
                {#if !showPromoInput}
                    <button onclick={() => showPromoInput = true}
                        class="text-xs text-purple-500 font-bold hover:text-purple-700 transition-colors">
                        Have a promo code? Click to redeem
                    </button>
                {:else}
                    <div class="space-y-3 bg-purple-50/50 rounded-[24px] p-4 border border-purple-100" transition:slide>
                        <h4 class="text-xs font-black uppercase tracking-widest text-purple-400">Redeem Gold Key Code</h4>
                        <div class="flex gap-2">
                            <input type="text" bind:value={promoCode}
                                placeholder="e.g. CS-GOLD-221"
                                class="flex-1 px-4 py-3 rounded-2xl border-2 border-purple-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                                disabled={promoLoading} />
                            <button onclick={handlePromoRedemption} disabled={promoLoading}
                                class="px-5 py-3 bg-purple-600 text-white font-bold text-sm rounded-2xl hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1">
                                Redeem
                            </button>
                        </div>
                        {#if promoError}
                            <p class="text-red-500 text-xs font-bold bg-red-50 p-2 rounded-xl" transition:slide>{promoError}</p>
                        {/if}
                        {#if promoSuccess}
                            <p class="text-green-600 text-xs font-bold bg-green-50 p-3 rounded-xl" transition:slide>{promoSuccess}</p>
                        {/if}
                        <button onclick={() => { showPromoInput = false; promoError = ''; promoSuccess = ''; }}
                            class="text-[10px] text-gray-400 font-bold hover:text-gray-600 underline">Cancel</button>
                    </div>
                {/if}
            </div>
        </section>

        <!-- Features Grid -->
        <section class="px-6 py-20 max-w-5xl mx-auto">
            <h2 class="text-3xl font-black text-center text-gray-900 mb-4">Why CycleSense?</h2>
            <p class="text-gray-500 text-center mb-12 max-w-md mx-auto">Every feature is designed with one thing in mind: your privacy.</p>
            
            <div class="grid md:grid-cols-2 gap-6">
                {#each features as feature}
                    <div class="p-8 rounded-[32px] bg-gray-50/50 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                        <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-200 transition-colors">
                            <feature.icon class="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 class="text-lg font-black text-gray-900 mb-2">{feature.title}</h3>
                        <p class="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                {/each}
            </div>
        </section>

        <!-- Pricing -->
        <section class="px-6 py-20 max-w-lg mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-black text-gray-900 mb-3">Choose Your Key</h2>
                <p class="text-gray-500 text-sm">Unlock full cycle insights and stay ahead of your health.</p>
            </div>

            <div class="bg-white rounded-[32px] border-2 border-purple-600 p-8 shadow-xl shadow-purple-100/50 relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-xs font-black uppercase tracking-widest text-purple-600">Gold Key Founder</span>
                            <div class="flex items-baseline gap-1 mt-2">
                                <span class="text-4xl font-black text-gray-900">$19.99</span>
                                <span class="text-gray-400 text-sm font-medium">/ year</span>
                            </div>
                        </div>
                        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Star class="w-7 h-7 text-purple-600 fill-purple-600" />
                        </div>
                    </div>
                    
                    <ul class="space-y-3 mb-8">
                        {#each ['6-Month cycle forecasting', 'Advanced cycle analysis charts', 'Detailed symptom patterns', 'Priority prediction algorithm', 'Ad-free experience', 'Exclusive Gold Key Badge'] as feature}
                            <li class="flex items-center gap-3 text-sm text-gray-700">
                                <div class="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                    <Check class="w-3 h-3 text-purple-600 stroke-[3]" />
                                </div>
                                {feature}
                            </li>
                        {/each}
                    </ul>

                    <button onclick={handleGoldKeyPurchase}
                        class="w-full bg-purple-600 text-white font-black text-base px-6 py-4 rounded-[20px] hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-200/50 flex items-center justify-center gap-2">
                        <Sparkles class="w-5 h-5" /> Get Gold Key — $19.99/yr
                    </button>
                </div>
            </div>
        </section>

        <!-- Privacy Badge Section -->
        <section class="px-6 py-16 max-w-3xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2 mb-6">
                <ShieldCheck class="w-4 h-4 text-green-600" />
                <span class="text-xs font-bold text-green-700 uppercase tracking-wider">Your data never leaves your device</span>
            </div>
            <p class="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                CycleSense stores all health data locally on your device using IndexedDB. 
                There are no servers, no cloud backups, no data brokers, and no third-party analytics. 
                Even we can't access your data — because we don't collect any.
            </p>
        </section>

        <!-- Footer -->
        <footer class="px-6 py-10 border-t border-gray-100">
            <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                    <Heart class="w-4 h-4 text-purple-400 fill-purple-200" />
                    <span class="text-sm font-bold text-gray-400">CycleSense</span>
                </div>
                <div class="flex items-center gap-6 text-xs text-gray-400 font-medium">
                    <a href="/privacy" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
                    <span>© 2026 CycleSense</span>
                </div>
            </div>
        </footer>
    </div>
{/if}