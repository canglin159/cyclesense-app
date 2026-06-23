<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { i18n } from '$lib/stores/i18nStore.svelte.js';
    import { 
        X, User, CreditCard, Bell, Shield, LogOut, 
        ChevronRight, Sparkles, Copy, Check, RefreshCw, Globe 
    } from '@lucide/svelte';
    import { fade, slide } from 'svelte/transition';

    let { onclose } = $props();

    let showCustomerCenter = $state(false);
    let idCopied = $state(false);
    let restoreId = $state('');
    let restoreLoading = $state(false);
    let restoreMessage = $state('');

    async function handleManageSubscription() {
        showCustomerCenter = true;
    }

    function copyId() {
        navigator.clipboard.writeText(appState.settings.userId);
        idCopied = true;
        setTimeout(() => idCopied = false, 2000);
    }

    async function handleRestore() {
        if (!restoreId || restoreId.length < 10) return;
        restoreLoading = true;
        restoreMessage = '';
        try {
            restoreId = '';
        } catch (e) {
            restoreMessage = 'Failed to restore. Please check the ID.';
        } finally {
            restoreLoading = false;
        }
    }
</script>

<div
    class="fixed inset-0 bg-white z-[150] flex flex-col font-sans"
    transition:fade
>
    {#if showCustomerCenter}
        <header class="px-6 pt-12 pb-4 flex items-center justify-between border-b border-purple-50">
            <h2 class="text-xl font-bold text-gray-800">Subscription</h2>
            <button onclick={() => showCustomerCenter = false} class="p-2 text-gray-400">
                <X class="w-6 h-6" />
            </button>
        </header>
        <div class="flex-1">
            <revenuecat-customer-center></revenuecat-customer-center>
        </div>
    {:else}
        <!-- Header -->
        <header class="px-6 pt-12 pb-6 flex items-center justify-between">
            <h2 class="text-3xl font-black text-gray-900 tracking-tight">{i18n.t('settings')}</h2>
            <button
                onclick={onclose}
                class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
                <X class="w-6 h-6" />
            </button>
        </header>

        <main class="flex-1 overflow-y-auto px-6 space-y-8 pb-10">
            <!-- Account Info -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Account</h3>
                <div class="bg-gray-50 rounded-[32px] p-6 space-y-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <User class="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p class="font-bold text-gray-900">Anonymous ID</p>
                                <p class="text-[10px] text-gray-400 font-mono">{appState.settings.userId.slice(0, 18)}...</p>
                            </div>
                        </div>
                        <button
                            onclick={copyId}
                            class="p-2 hover:bg-white rounded-xl transition-colors"
                        >
                            {#if idCopied}
                                <Check class="w-5 h-5 text-green-500" />
                            {:else}
                                <Copy class="w-5 h-5 text-gray-300" />
                            {/if}
                        </button>
                    </div>

            {#if appState.settings.isGuardian}
                <section class="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <a 
                        href="/guardian" 
                        class="w-full bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-[32px] p-6 flex items-center justify-between text-white shadow-xl shadow-purple-200/50 relative overflow-hidden group active:scale-95 transition-all"
                    >
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <div class="flex items-center gap-4 relative z-10">
                            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <img src="/assets/icons/guardian_badge.svg" alt="Guardian Badge" class="w-8 h-8" />
                            </div>
                            <div class="text-left">
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Community Guardian</p>
                                <p class="text-lg font-bold leading-tight">Guardian Dashboard</p>
                            </div>
                        </div>
                        <div class="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center relative z-10">
                            <span class="text-xs">→</span>
                        </div>
                    </a>
                </section>
            {/if}
                    {#if !premiumStore.isPremium}
                        <div class="p-4 bg-purple-100/50 rounded-2xl flex items-center gap-3">
                            <Sparkles class="w-5 h-5 text-purple-600" />
                            <p class="text-xs text-purple-700 font-medium">Free Tier User</p>
                        </div>
                    {:else}
                        <div class="p-4 bg-indigo-600 rounded-2xl flex items-center gap-3 text-white shadow-lg shadow-indigo-100">
                            <Sparkles class="w-5 h-5 fill-white" />
                            <p class="text-xs font-bold uppercase tracking-widest">Gold Key Member</p>
                        </div>
                    {/if}
                </div>
            </section>

            <!-- Restore Section -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Restore Session</h3>
                <div class="bg-gray-50 rounded-[32px] p-6 space-y-4">
                    <p class="text-xs text-gray-500 leading-relaxed">
                        If you've switched devices, enter your Anonymous ID below to restore your Pro status.
                    </p>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            bind:value={restoreId}
                            placeholder="Enter your ID"
                            class="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                        />
                        <button
                            onclick={handleRestore}
                            disabled={restoreLoading || !restoreId}
                            class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                        >
                            {#if restoreLoading}
                                <RefreshCw class="w-4 h-4 animate-spin" />
                            {:else}
                                Restore
                            {/if}
                        </button>
                    </div>
                    {#if restoreMessage}
                        <p class="text-[10px] font-medium {restoreMessage.includes('Success') ? 'text-green-500' : 'text-red-400'} px-1">
                            {restoreMessage}
                        </p>
                    {/if}
                </div>
            </section>

            <!-- Subscription Section -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Subscription</h3>
                <button
                    onclick={handleManageSubscription}
                    class="w-full bg-gray-50 rounded-[32px] p-6 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <CreditCard class="w-6 h-6 text-gray-400" />
                        </div>
                        <div class="text-left">
                            <p class="font-bold text-gray-900">Manage Plan</p>
                            <p class="text-xs text-gray-400">Billing and payments</p>\n                        </div>
                    </div>
                    <ChevronRight class="w-5 h-5 text-gray-300" />
                </button>
            </section>

            <!-- Preferences -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Preferences</h3>
                <div class="bg-gray-50 rounded-[32px] divide-y divide-gray-100">
                    <!-- Language Switcher -->
                    <div class="p-6 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Globe class="w-6 h-6 text-gray-400" />
                            </div>
                            <p class="font-bold text-gray-900">Language</p>
                        </div>
                        <select 
                            class="bg-white border border-gray-100 rounded-xl px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            value={i18n.locale}
                            onchange={(e) => i18n.setLocale(e.target.value)}
                        >
                            <option value="en">English</option>\n                            <option value="de">Deutsch</option>\n                            <option value="br">Português</option>\n                            <option value="jp">日本語</option>\n                        </select>
                    </div>
                    
                    <div class="p-6 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Bell class="w-6 h-6 text-gray-400" />
                            </div>
                            <p class="font-bold text-gray-900">Notifications</p>
                        </div>
                        <div class="w-12 h-6 bg-purple-600 rounded-full relative">
                            <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                    <div class="p-6 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Shield class="w-6 h-6 text-gray-400" />
                            </div>
                            <p class="font-bold text-gray-900">Privacy Mode</p>
                        </div>
                        <div class="w-12 h-6 bg-gray-200 rounded-full relative">
                            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <div class="text-center space-y-4 pt-10 pb-20">
                <p class="text-[10px] text-gray-300 font-medium">CycleSense v0.0.1 (Alpha)</p>
                <button class="text-red-400 text-xs font-bold flex items-center gap-2 mx-auto opacity-50">
                    <LogOut class="w-4 h-4" />
                    Reset All Data
                </button>
            </div>
        </main>
    {/if}
</div>
