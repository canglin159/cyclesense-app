<script>
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { Heart, ShieldCheck, Download, Calendar, AlertCircle, Loader2 } from '@lucide/svelte';
    import { importKey, decryptData } from '$lib/utils/crypto.js';

    let { data } = $props();

    let decryptedData = $state(null);
    let error = $state(null);
    let loading = $state(true);

    onMount(async () => {
        if (data.error) {
            error = data.error === 'expired' ? 'This link has expired.' : 'Unable to load shared status.';
            loading = false;
            return;
        }

        try {
            const keyStr = window.location.hash.substring(1);
            if (!keyStr) {
                error = 'This link is missing a security key.';
                loading = false;
                return;
            }

            const key = await importKey(keyStr);
            decryptedData = await decryptData(data.share, key);
        } catch (e) {
            console.error('Decryption failed:', e);
            error = 'Invalid or corrupted security key.';
        } finally {
            loading = false;
        }
    });

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    }
</script>

<svelte:head>
    <title>CycleSense Status Share</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
</svelte:head>

<div class="min-h-screen bg-[#FFF5F7] flex flex-col items-center p-6 font-sans">
    <header class="w-full max-w-md flex justify-center py-8">
        <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Heart class="w-6 h-6 text-white fill-white" />
            </div>
            <span class="text-2xl font-black text-gray-900 tracking-tight">CycleSense</span>
        </div>
    </header>

    <main class="w-full max-w-md flex-1">
        {#if loading}
            <div class="flex flex-col items-center justify-center py-20 gap-4" transition:fade>
                <Loader2 class="w-8 h-8 text-purple-400 animate-spin" />
                <p class="text-purple-400 font-bold text-sm uppercase tracking-widest">Decrypting...</p>
            </div>
        {:else if error}
            <div class="bg-white rounded-[40px] p-8 shadow-xl shadow-pink-100/50 border border-pink-50 flex flex-col items-center text-center gap-6" transition:scale>
                <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle class="w-8 h-8 text-red-400" />
                </div>
                <div class="space-y-2">
                    <h2 class="text-xl font-black text-gray-900">Oops!</h2>
                    <p class="text-gray-500 font-medium">{error}</p>
                </div>
                <a href="/" class="w-full py-4 bg-gray-900 text-white rounded-[24px] font-bold text-sm hover:bg-gray-800 transition-colors">
                    Go to Home
                </a>
            </div>
        {:else if decryptedData}
            <div class="space-y-6" transition:fade>
                <div class="bg-white rounded-[40px] p-8 shadow-xl shadow-pink-100/50 border border-pink-50 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-6">
                        <ShieldCheck class="w-5 h-5 text-green-400" />
                    </div>
                    
                    <div class="space-y-8 relative z-10">
                        <div class="space-y-2">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Secure Status Share</p>
                            <h2 class="text-3xl font-black text-gray-900 leading-tight">
                                {decryptedData.userName || 'A friend'} shared their cycle prediction
                            </h2>
                        </div>

                        <div class="space-y-6">
                            {#if decryptedData.nextPeriodStart}
                                <div class="bg-pink-50 rounded-[32px] p-6 space-y-3">
                                    <div class="flex items-center gap-2 text-pink-500">
                                        <Calendar class="w-4 h-4" />
                                        <span class="text-[10px] font-black uppercase tracking-widest">Expected Period</span>
                                    </div>
                                    <p class="text-xl font-black text-gray-900">
                                        {formatDate(decryptedData.nextPeriodStart)}
                                    </p>
                                </div>
                            {/if}

                            {#if decryptedData.fertileWindowStart && decryptedData.fertileWindowEnd}
                                <div class="bg-purple-50 rounded-[32px] p-6 space-y-3">
                                    <div class="flex items-center gap-2 text-purple-500">
                                        <Calendar class="w-4 h-4" />
                                        <span class="text-[10px] font-black uppercase tracking-widest">Fertile Window</span>
                                    </div>
                                    <p class="text-xl font-black text-gray-900">
                                        {formatDate(decryptedData.fertileWindowStart)} — {formatDate(decryptedData.fertileWindowEnd)}
                                    </p>
                                </div>
                            {/if}
                        </div>

                        <p class="text-gray-400 text-xs font-medium italic">
                            This data is end-to-end encrypted and will expire in 48 hours.
                        </p>
                    </div>

                    <!-- Decorative elements -->
                    <div class="absolute -left-8 -bottom-8 w-32 h-32 bg-pink-100/30 rounded-full blur-3xl"></div>
                </div>

                <div class="bg-gray-900 rounded-[40px] p-8 text-white space-y-6 shadow-2xl">
                    <div class="space-y-2">
                        <h3 class="text-xl font-black">Get CycleSense</h3>
                        <p class="text-gray-400 text-sm font-medium">
                            Join 10,000+ others using the most private, minimalist cycle tracker ever built.
                        </p>
                    </div>

                    <a 
                        href="https://cyclesense.app" 
                        class="flex items-center justify-center gap-3 w-full py-4 bg-white text-gray-900 rounded-[24px] font-black text-sm hover:bg-gray-100 transition-all"
                    >
                        <Download class="w-4 h-4" />
                        Download Now
                    </a>

                    <div class="flex items-center justify-center gap-4 pt-2">
                        <div class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <ShieldCheck class="w-3 h-3" /> Zero Knowledge
                        </div>
                        <div class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <Heart class="w-3 h-3" /> Local First
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </main>

    <footer class="py-8">
        <p class="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Privacy first. Always.</p>
    </footer>
</div>

<style>
    :global(body) {
        background-color: #FFF5F7;
    }
</style>
