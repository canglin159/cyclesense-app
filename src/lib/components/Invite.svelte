<script>
    import { referralStore } from '$lib/stores/referralStore.svelte.js';
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { Share2, Copy, Check, Gift, Sparkles, X } from '@lucide/svelte';
    import { fade, fly } from 'svelte/transition';

    let { onclose } = $props();
    let copied = $state(false);

    async function handleShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'CycleSense Pro',
                    text: referralStore.referralMessage,
                    url: referralStore.referralLink
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(referralStore.referralLink);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }
</script>

<div 
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
    transition:fade
    onclick={onclose}
>
    <div 
        class="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
        transition:fly={{ y: 100 }}
        onclick={e => e.stopPropagation()}
    >
        <div class="relative p-8 text-center">
            <button 
                onclick={onclose}
                class="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
                <X class="w-5 h-5" />
            </button>

            <div class="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Gift class="w-10 h-10 text-purple-600" />
            </div>

            <h2 class="text-2xl font-black text-gray-900 mb-2">Give a Month, Get a Month</h2>
            <p class="text-gray-500 mb-8 px-4">
                Share CycleSense with a friend. When they log their first cycle, you both get <span class="text-purple-600 font-bold">1 month of Pro</span> for free.
            </p>

            {#if appState.isScarcityActive}
                <div class="mb-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-left">
                    <p class="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1">Bonus Scarcity</p>
                    <p class="text-xs text-yellow-800 font-medium">
                        Your friends can also claim a <span class="font-bold">Gold Key</span> for $19.99/yr if they join now!
                    </p>
                </div>
            {/if}

            <div class="bg-purple-50 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4 border border-purple-100">
                <div class="text-left overflow-hidden">
                    <p class="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Your Referral Link</p>
                    <p class="text-sm font-medium text-purple-900 truncate">{referralStore.referralLink}</p>
                </div>
                <button 
                    onclick={handleCopy}
                    class="p-3 bg-white text-purple-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    {#if copied}
                        <Check class="w-5 h-5" />
                    {:else}
                        <Copy class="w-5 h-5" />
                    {/if}
                </button>
            </div>

            <button 
                onclick={handleShare}
                class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95 mb-4"
            >
                <Share2 class="w-5 h-5" />
                Share with Friends
            </button>

            <div class="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <Sparkles class="w-3 h-3" />
                No accounts or emails required
            </div>
        </div>

        {#if premiumStore.isPremium}
            <div class="bg-purple-900 p-6 text-white text-center">
                <p class="text-sm font-medium opacity-80">Referral status: Active</p>
            </div>
        {/if}
    </div>
</div>
