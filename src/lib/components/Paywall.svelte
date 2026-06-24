<script>
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { appState } from '$lib/stores/appState.svelte.js';
    import { Sparkles, Check, Loader2, X, ShieldCheck, Zap, Star } from '@lucide/svelte';
    import { fade, scale, slide } from 'svelte/transition';

    let { onclose } = $props();
    let loading = $state(false);
    let error = $state(null);
    let useFallback = $state(true); // Default to custom UI for Independent Web Launch

    const features = [
        "6-Month cycle forecasting",
        "Advanced cycle analysis charts",
        "Detailed symptom patterns",
        "Priority prediction algorithm",
        "Ad-free experience",
        "Exclusive 'Gold Key' Badge"
    ];

    const foundingPriceId = "price_1TltDoAtAUhqLR0QVVkNxXC3"; // $19.99/yr
    const monthlyPriceId = "price_1Tf53bAtAUhqLR0QqUwsNhNQ"; // $9.99/mo

    async function handleUpgrade(packageId) {
        loading = true;
        error = null;
        try {
            await premiumStore.upgrade(packageId);
            onclose();
        } catch (e) {
            error = e.message;
            loading = false;
        }
    }

    // Attempt to detect if rc-paywall failed to load or is not supported
    // In a real app, you might listen for an error event from the custom element
</script>

<div 
    class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
    transition:fade
>
    <div 
        class="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        transition:scale={{ start: 0.9, duration: 300 }}
    >
        <!-- Close Button -->
        <button 
            onclick={onclose}
            class="absolute top-6 right-6 p-2 bg-gray-100/50 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-700 transition-colors z-[120]"
        >
            <X class="w-5 h-5" />
        </button>

        <!-- Mission Header (Always show for Independent Web Launch) -->
        <div class="bg-indigo-600 p-4 text-center relative overflow-hidden shrink-0">
            <div class="relative z-10">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Support Our Independent Launch</p>
                <h2 class="text-white font-black text-xl flex items-center justify-center gap-2">
                    Gold Key Founder <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </h2>
                <p class="text-indigo-100 text-xs mt-1">Help us reach our $124 store funding goal. Gold Key purchases go directly toward Apple ($99) + Google ($25) developer fees.</p>
            </div>
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div class="absolute -left-8 -top-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div class="flex-1 overflow-y-auto">
            {#if useFallback}
                <div class="p-8 space-y-8">
                    <div class="space-y-4">
                        <h3 class="text-2xl font-black text-gray-900 leading-tight">
                            Choose Your Key
                        </h3>
                        <p class="text-gray-500 text-sm">
                            Unlock full cycle insights and stay ahead of your health.
                        </p>
                    </div>

                    <div class="space-y-4">
                        {#if appState.isScarcityActive}
                            <button 
                                onclick={() => handleUpgrade(foundingPriceId)}
                                disabled={loading}
                                class="w-full p-6 rounded-[32px] border-2 border-indigo-600 bg-indigo-50/50 flex flex-col items-start gap-1 relative overflow-hidden group transition-all hover:bg-indigo-50"
                            >
                                <div class="flex justify-between w-full items-center">
                                    <span class="font-black text-indigo-600 text-lg">Gold Key Founder</span>
                                    <span class="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Fund the Launch</span>
                                </div>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl font-black text-gray-900">$19.99</span>
                                    <span class="text-gray-400 text-sm font-medium">/ year</span>
                                </div>
                                <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Goes toward App Store + Play Store fees</p>
                            </button>
                        {/if}

                        <button 
                            onclick={() => handleUpgrade(monthlyPriceId)}
                            disabled={loading}
                            class="w-full p-6 rounded-[32px] border-2 border-gray-100 bg-gray-50/50 flex flex-col items-start gap-1 transition-all hover:border-purple-200 hover:bg-purple-50/30"
                        >
                            <span class="font-bold text-gray-900">Standard Key</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-xl font-black text-gray-900">$9.99</span>
                                <span class="text-gray-400 text-sm font-medium">/ month</span>
                            </div>
                        </button>
                    </div>

                    <div class="space-y-4 bg-gray-50 rounded-[32px] p-6">
                        <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Gold Key Perks</h4>
                        <ul class="space-y-3">
                            {#each features as feature}
                                <li class="flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <div class="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                                        <Check class="w-3 h-3 text-green-500 stroke-[3]" />
                                    </div>
                                    {feature}
                                </li>
                            {/each}
                        </ul>
                    </div>

                    {#if error}
                        <p class="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-2xl" transition:slide>
                            {error}
                        </p>
                    {/if}

                    <div class="pt-4 text-center">
                        <button 
                            class="text-xs text-gray-400 font-bold hover:text-gray-600 underline"
                            onclick={onclose}
                        >
                            Not right now
                        </button>
                    </div>
                </div>
            {:else}
                <div class="w-full h-full min-h-[600px] flex flex-col">
                    <rc-paywall 
                        app-user-id={appState.settings.userId}
                        class="flex-1"
                        onerror={() => useFallback = true}
                    ></rc-paywall>
                </div>
            {/if}
        </div>

        <footer class="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-center gap-6 shrink-0">
            <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck class="w-3 h-3" /> Secure
            </div>
            <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Zap class="w-3 h-3" /> Instant Access
            </div>
        </footer>
    </div>
</div>

<style>
    /* Styling the rc-paywall component if needed */
    rc-paywall {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>