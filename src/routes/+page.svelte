<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import Onboarding from '$lib/components/Onboarding.svelte';
    import Calendar from '$lib/components/Calendar.svelte';
    import History from '$lib/components/History.svelte';
    import Insights from '$lib/components/Insights.svelte';
    import Paywall from '$lib/components/Paywall.svelte';
    import SettingsView from '$lib/components/Settings.svelte';
    import InviteView from '$lib/components/Invite.svelte';
    import SafeShareView from '$lib/components/SafeShare.svelte';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { referralStore } from '$lib/stores/referralStore.svelte.js';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { Heart, Settings, Plus, LayoutGrid, Calendar as CalendarIcon, History as HistoryIcon, Sparkles, Gift } from '@lucide/svelte';

    let activeTab = $state('calendar');
    let upgradeStatus = $state(null);
    let showPaywall = $state(false);
    let showSettings = $state(false);
    let showInvite = $state(false);
    let showSafeShare = $state(false);

    onMount(async () => {
        const sessionId = page.url.searchParams.get('session_id');
        const upgrade = page.url.searchParams.get('upgrade');
        
        if (upgrade === 'success' && sessionId) {
            upgradeStatus = 'loading';
            const success = await premiumStore.verifyStripeSession(sessionId);
            upgradeStatus = success ? 'success' : 'error';
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (upgrade === 'cancelled') {
            upgradeStatus = 'cancelled';
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });

    async function handleLogPeriod() {
        const today = new Date().toISOString().split('T')[0];
        // For simplicity in MVP, we just log a single day or start of a period
        // Real implementation would have a modal to select range
        await appState.addCycle({
            periodStart: today,
            periodEnd: today // Defaulting to 1 day for quick log
        });
    }
</script>

{#if !appState.settings.onboarded}
    <Onboarding />
{:else}
    <div class="min-h-screen bg-purple-50 pb-24 font-sans text-gray-800">
        <!-- Header -->
        <header class="p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Heart class="w-5 h-5 text-purple-600 fill-purple-600" />
                </div>
                <div>
                    <h1 class="text-xl font-bold tracking-tight text-purple-900">CycleSense</h1>
                    {#if premiumStore.isPremium}
                        <span class="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Sparkles class="w-2 h-2 fill-purple-600" /> Premium
                        </span>
                    {/if}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button 
                    onclick={() => showInvite = true}
                    class="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <Gift class="w-5 h-5 text-purple-600" />
                </button>
                <button 
                    onclick={() => showSettings = true}
                    class="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <Settings class="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </header>

        {#if !premiumStore.isPremium && referralStore.referredBy && appState.cycles.length === 0}
            <div class="mx-6 mb-6 p-4 bg-purple-900 rounded-[32px] text-white shadow-lg shadow-purple-100 flex items-center justify-between overflow-hidden relative group">
                <div class="relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-purple-200">Special Gift</span>
                    </div>
                    <h3 class="text-lg font-black leading-tight">1 Month Pro Waiting</h3>
                    <p class="text-xs text-purple-200 font-medium">Log your first cycle to unlock your free month.</p>
                </div>
                <div class="bg-white/10 p-3 rounded-2xl backdrop-blur-md z-10">
                    <Gift class="w-6 h-6 text-purple-200" />
                </div>
            </div>
        {/if}

        {#if !premiumStore.isPremium && appState.isScarcityActive}
            <div class="mx-6 mb-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[32px] text-white shadow-lg shadow-purple-100 flex items-center justify-between overflow-hidden relative group cursor-pointer" onclick={() => showPaywall = true}>
                <div class="relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Limited Offer</span>
                        <span class="text-[10px] font-medium text-purple-100 italic">Only {10000 - appState.userCount} Gold Keys left!</span>
                    </div>
                    <h3 class="text-lg font-black leading-tight">Gold Key Member</h3>
                    <p class="text-xs text-purple-100 font-medium">Unlock Premium for just $19.99/year forever.</p>
                </div>
                <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-md z-10 group-hover:scale-110 transition-transform">
                    <Sparkles class="w-6 h-6 text-white fill-white" />
                </div>
                <!-- Animated Background Elements -->
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div class="absolute -left-4 -bottom-4 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl group-hover:translate-x-10 transition-transform duration-700"></div>
            </div>
        {/if}

        <main class="px-6 space-y-6">
            {#if activeTab === 'calendar'}
                <Calendar onsafeshare={() => showSafeShare = true} />
            {:else if activeTab === 'history'}
                <History />
            {:else}
                <Insights 
                    onrequestupgrade={() => showPaywall = true} 
                    onsafeshare={() => showSafeShare = true} 
                />
            {/if}
        </main>

        {#if showPaywall}
            <Paywall onclose={() => showPaywall = false} />
        {/if}

        {#if showSettings}
            <SettingsView onclose={() => showSettings = false} />
        {/if}

        {#if showInvite}
            <InviteView onclose={() => showInvite = false} />
        {/if}

        {#if showSafeShare}
            <SafeShareView onclose={() => showSafeShare = false} />
        {/if}

        <!-- Navigation Bar -->
        <nav class="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-transparent pointer-events-none">
            <div class="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-2 flex items-center justify-between pointer-events-auto">
                <button 
                    onclick={() => activeTab = 'calendar'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'calendar' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <CalendarIcon class="w-6 h-6 mb-1" />
                    <span class="text-[10px] font-bold uppercase tracking-tighter">Calendar</span>
                </button>

                <button 
                    onclick={() => activeTab = 'history'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'history' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <HistoryIcon class="w-6 h-6 mb-1" />
                    <span class="text-[10px] font-bold uppercase tracking-tighter">History</span>
                </button>

                <button 
                    onclick={handleLogPeriod}
                    class="w-14 h-14 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center -mt-8 hover:bg-purple-700 active:scale-95 transition-all group"
                >
                    <Plus class="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <button 
                    onclick={() => activeTab = 'insights'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'insights' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <LayoutGrid class="w-6 h-6 mb-1" />
                    <span class="text-[10px] font-bold uppercase tracking-tighter">Insights</span>
                </button>
            </div>
        </nav>
    </div>
{/if}
