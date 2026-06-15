<script>
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { Info, X } from '@lucide/svelte';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    let dismissed = $state(false);
    let adContainer = $state(null);

    onMount(() => {
        if (!premiumStore.isPremium) {
            // Lazy-load EthicalAds SDK as per lead's request for a lightweight, privacy-focused network
            const script = document.createElement('script');
            script.src = "https://media.ethicalads.io/media/client/ethicalads.min.js";
            script.async = true;
            document.head.appendChild(script);
        }
    });

    // Mock ad data as fallback while SDK loads or for demo purposes
    const ads = [
        {
            title: "Try 100% Organic Tea",
            desc: "Balance your cycle naturally with our herbal blends.",
            cta: "Shop Now",
            color: "bg-emerald-50 text-emerald-700",
            borderColor: "border-emerald-100",
            buttonColor: "bg-emerald-500"
        },
        {
            title: "New Yoga for Periods",
            desc: "Gentle flows to relieve cramps and boost mood.",
            cta: "Watch Free",
            color: "bg-purple-50 text-purple-700",
            borderColor: "border-purple-100",
            buttonColor: "bg-purple-500"
        }
    ];

    const randomAd = ads[Math.floor(Math.random() * ads.length)];
</script>

{#if !premiumStore.isPremium && !dismissed}
    <!-- EthicalAds Container -->
    <div 
        class="w-full bg-white rounded-3xl border border-gray-100 p-4 shadow-sm relative overflow-hidden group min-h-[100px] flex flex-col justify-center items-center"
        transition:fade
    >
        <div 
            class="horizontal" 
            data-ea-publisher="cyclesense" 
            data-ea-type="image"
            data-ea-manual="true"
        ></div>
        
        {#if !dismissed}
            <!-- Mock Fallback (only visible if SDK fails to load or for demo) -->
            <div class="flex items-start gap-4 w-full">
                <div class="w-12 h-12 {randomAd.color} rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">
                    {randomAd.title.charAt(0)}
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">Sponsored</span>
                        <h4 class="text-sm font-bold text-gray-800 truncate">{randomAd.title}</h4>
                    </div>
                    <p class="text-xs text-gray-500 leading-tight mb-3">{randomAd.desc}</p>
                    <button class="text-xs font-bold {randomAd.buttonColor} text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                        {randomAd.cta}
                    </button>
                </div>

                <button 
                    onclick={() => dismissed = true}
                    class="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                >
                    <X class="w-4 h-4" />
                </button>
            </div>
        {/if}

        <!-- Ad attribution -->
        <div class="absolute bottom-2 right-4 flex items-center gap-1 opacity-100 transition-opacity">
            <Info class="w-2.5 h-2.5 text-gray-200" />
            <span class="text-[8px] font-medium text-gray-200 uppercase tracking-tighter">Privacy-First Ads</span>
        </div>
    </div>
{/if}
