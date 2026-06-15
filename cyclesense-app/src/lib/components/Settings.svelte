<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { X, User, CreditCard, Bell, Shield, LogOut, ChevronRight, Sparkles, Copy, Check, RefreshCw } from '@lucide/svelte';
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
            // In a real app, this would fetch from a sync service.
            // For CycleSense, since it's local-first, "Restore" primarily means
            // setting the userId to the restored one so RevenueCat can find entitlements.
            await appState.updateSetting('userId', restoreId);
            await appState.updateSetting('referralId', restoreId);
            await premiumStore.init(); // Re-init with new ID
            restoreMessage = 'Success! Your session has been restored.';
            restoreId = '';
        } catch (e) {
            restoreMessage = 'Failed to restore. Please check the ID.';
        } finally {
            restoreLoading = false;
        }
    }
</script>

<div 
    class="fixed inset-0 bg-white z-[150] flex flex-col"
    transition:fade
>
    {#if showCustomerCenter}
        <header class="p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] flex items-center justify-between border-b border-gray-50">
            <h2 class="text-xl font-bold text-gray-900">Manage Subscription</h2>
            <button 
                onclick={() => showCustomerCenter = false}
                class="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X class="w-5 h-5" />
            </button>
        </header>
        <div class="flex-1 overflow-y-auto">
            <rc-customer-center app-user-id={appState.settings.userId}></rc-customer-center>
        </div>
    {:else}
        <header class="p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] flex items-center justify-between border-b border-gray-50">
            <h2 class="text-xl font-bold text-gray-900">Settings</h2>
            <button 
                onclick={onclose}
                class="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X class="w-5 h-5" />
            </button>
        </header>

        <main class="flex-1 overflow-y-auto p-6 space-y-8">
            <!-- Account Section -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Account</h3>
                <div class="bg-gray-50 rounded-[32px] overflow-hidden">
                    <div class="p-6 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <User class="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p class="font-bold text-gray-900">Anonymous User</p>
                                <div class="flex items-center gap-2">
                                    <p class="text-xs text-gray-400">ID: {appState.settings.userId?.slice(0, 8)}...</p>
                                    <button 
                                        onclick={copyId}
                                        class="p-1 hover:bg-gray-100 rounded transition-colors text-purple-400"
                                        title="Copy ID"
                                    >
                                        {#if idCopied}
                                            <Check class="w-3 h-3" />
                                        {:else}
                                            <Copy class="w-3 h-3" />
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {#if premiumStore.isPremium}
                            <span class="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                                <Star class="w-2 h-2 fill-yellow-400 text-yellow-400" /> Gold Key
                            </span>
                        {/if}
                    </div>
                    
                    {#if !premiumStore.isPremium}
                        <div class="px-6 pb-6">
                            <button 
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
                            >
                                <Sparkles class="w-4 h-4 fill-white" />
                                Upgrade to Premium
                            </button>
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
                            <p class="text-xs text-gray-400">Billing and payments</p>
                        </div>
                    </div>
                    <ChevronRight class="w-5 h-5 text-gray-300" />
                </button>
            </section>

            <!-- Preferences -->
            <section class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Preferences</h3>
                <div class="bg-gray-50 rounded-[32px] divide-y divide-gray-100">
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
