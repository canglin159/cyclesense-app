<script>
    import { shareStore } from '$lib/stores/shareStore.svelte.js';
    import { Share2, Copy, Check, ShieldCheck, X, Loader2, Lock } from '@lucide/svelte';
    import { fade, fly } from 'svelte/transition';

    let { onclose } = $props();
    let loading = $state(false);
    let shareUrl = $state(null);
    let copied = $state(false);
    let error = $state(null);

    async function handleCreateShare() {
        loading = true;
        error = null;
        try {
            shareUrl = await shareStore.createShare();
        } catch (e) {
            console.error('Failed to create share:', e);
            error = "Unable to create secure link. Please try again.";
        } finally {
            loading = false;
        }
    }

    async function handleShare() {
        if (navigator.share && shareUrl) {
            try {
                await navigator.share({
                    title: 'My CycleSense Status',
                    text: 'I\'m sharing my cycle status with you via CycleSense. This link is encrypted and will expire in 48 hours.',
                    url: shareUrl
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    }

    function handleCopy() {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            copied = true;
            setTimeout(() => copied = false, 2000);
        }
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

            <div class="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                <ShieldCheck class="w-10 h-10 text-pink-600" />
            </div>

            {#if !shareUrl}
                <h2 class="text-2xl font-black text-gray-900 mb-2">Safe Share</h2>
                <p class="text-gray-500 mb-8 px-4 text-sm leading-relaxed">
                    Share your current cycle status with a partner. We use <span class="text-pink-600 font-bold">zero-knowledge encryption</span>, meaning only the person with the link can see your data.
                </p>

                <div class="space-y-4 mb-8">
                    <div class="flex items-start gap-4 text-left bg-gray-50 p-4 rounded-2xl">
                        <Lock class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <p class="text-sm font-bold text-gray-700">Private & Secure</p>
                            <p class="text-xs text-gray-400">The decryption key stays in the URL hash and never touches our servers.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onclick={handleCreateShare}
                    disabled={loading}
                    class="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {#if loading}
                        <Loader2 class="w-5 h-5 animate-spin" />
                        Generating Secure Link...
                    {:else}
                        <Share2 class="w-5 h-5" />
                        Create Secure Share Link
                    {/if}
                </button>
            {:else}
                <h2 class="text-2xl font-black text-gray-900 mb-2">Link Ready!</h2>
                <p class="text-gray-500 mb-8 px-4 text-sm">
                    This link will expire in <span class="font-bold">48 hours</span>. Send it to your partner now.
                </p>

                <div class="bg-pink-50 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4 border border-pink-100">
                    <div class="text-left overflow-hidden">
                        <p class="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1">Encrypted Link</p>
                        <p class="text-sm font-medium text-pink-900 truncate">{shareUrl}</p>
                    </div>
                    <button 
                        onclick={handleCopy}
                        class="p-3 bg-white text-pink-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
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
                    class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-95 mb-4"
                >
                    <Share2 class="w-5 h-5" />
                    Share with Partner
                </button>
            {/if}

            {#if error}
                <p class="text-red-500 text-xs font-bold mt-4 bg-red-50 p-3 rounded-xl">{error}</p>
            {/if}

            <div class="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium mt-6">
                <ShieldCheck class="w-3 h-3" />
                End-to-End Encrypted
            </div>
        </div>
    </div>
</div>
