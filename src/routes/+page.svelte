<script>
    import { onMount } from 'svelte';
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { i18n } from '$lib/stores/i18nStore.svelte.js';
    import { fade, slide, fly } from 'svelte/transition';
    import { 
        Plus, Calendar as CalendarIcon, History as HistoryIcon, 
        LayoutGrid, Settings, Share2, Sparkles, Gift, BookOpen, Heart,
        ChevronRight, Smartphone
    } from '@lucide/svelte';

    // Components
    import Calendar from '$lib/components/Calendar.svelte';
    import History from '$lib/components/History.svelte';
    import Insights from '$lib/components/Insights.svelte';
    import Onboarding from '$lib/components/Onboarding.svelte';
    import Paywall from '$lib/components/Paywall.svelte';
    import SettingsView from '$lib/components/Settings.svelte';
    import InviteView from '$lib/components/Invite.svelte';
    import SafeShareView from '$lib/components/SafeShare.svelte';
    import FoundersLetterModal from '$lib/components/FoundersLetterModal.svelte';
    import Guides from '$lib/components/Guides.svelte';
    import AnalyticsPrompt from '$lib/components/AnalyticsPrompt.svelte';
    import InstallApp from '$lib/components/InstallApp.svelte';

    let activeTab = $state('calendar');
    let showPaywall = $state(false);
    let showSettings = $state(false);
    let showInvite = $state(false);
    let showSafeShare = $state(false);
    let showGuides = $state(false);
    let showAnalyticsPrompt = $state(false);
    let showInstallApp = $state(false);
    let isStandalone = $state(false);

    onMount(async () => {
        await appState.init();
        await premiumStore.init();
        i18n.init();

        isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (appState.settings.onboarded && !appState.settings.analyticsPromptShown) {
            showAnalyticsPrompt = true;
        }
    });

    async function closeAnalyticsPrompt() {
        showAnalyticsPrompt = false;
        await appState.updateSetting('analyticsPromptShown', true);
    }

    function handleLogPeriod() {
        // Logic to log today as start of period
        const today = new Date().toISOString().split('T')[0];
        appState.addCycle({
            periodStart: today,
            periodEnd: today // Will be updated later
        });
        activeTab = 'calendar';
    }
</script>

{#if !appState.settings.onboarded}
    <Onboarding />
{:else}
    <div class="min-h-screen bg-white pb-32 font-sans">
        <!-- Header -->
        <header class="flex items-center justify-between px-6 pt-12 pb-4">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <Heart class="w-5 h-5 text-white fill-white" />
                </div>
                <h1 class="text-xl font-black text-gray-900 tracking-tight">CycleSense</h1>
            </div>
            <div class="flex items-center gap-2">
                <button 
                    onclick={() => showInvite = true}
                    class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-purple-50 hover:text-purple-600 transition-all"
                >
                    <Share2 class="w-5 h-5" />
                </button>
                <button 
                    onclick={() => showSettings = true}
                    class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-purple-50 hover:text-purple-600 transition-all"
                >
                    <Settings class="w-5 h-5" />
                </button>
            </div>
        </header>

        {#if !isStandalone}
            <div class="mx-6 mb-6 p-4 bg-white rounded-[32px] border-2 border-dashed border-purple-200 flex items-center justify-between cursor-pointer group hover:border-purple-400 transition-all" onclick={() => showInstallApp = true}>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <Smartphone class="w-6 h-6" />
                    </div>
                    <div>
                        <h3 class="text-sm font-black text-gray-900">Install CycleSense</h3>
                        <p class="text-xs text-gray-500 font-medium">Add to home screen for the full experience</p>
                    </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
            </div>
        {/if}

        {#if !premiumStore.isPremium && appState.cycles.length === 1}
            <!-- First Cycle Reward -->
            <div class="mx-6 mb-6 p-5 bg-purple-600 rounded-[32px] text-white shadow-xl shadow-purple-100 flex items-center justify-between relative overflow-hidden group cursor-pointer" onclick={() => showPaywall = true}>
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
        {#if showGuides}
            <Guides onclose={() => showGuides = false} />
        {/if}

        {#if showAnalyticsPrompt}
            <AnalyticsPrompt onclose={closeAnalyticsPrompt} />
        {/if}

        <FoundersLetterModal onopenshare={() => showSafeShare = true} />

        {#if showInstallApp}
            <InstallApp onclose={() => showInstallApp = false} />
        {/if}

        <!-- Navigation Bar -->
        <nav class="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-transparent pointer-events-none">
            <div class="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-2 flex items-center justify-between pointer-events-auto">
                <button
                    onclick={() => activeTab = 'calendar'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'calendar' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <CalendarIcon class="w-5 h-5 mb-1" />
                    <span class="text-[9px] font-bold uppercase tracking-tighter">{i18n.t('calendar')}</span>
                </button>
                <button
                    onclick={() => activeTab = 'history'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'history' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <HistoryIcon class="w-5 h-5 mb-1" />
                    <span class="text-[9px] font-bold uppercase tracking-tighter">{i18n.t('history')}</span>
                </button>
                <button
                    onclick={handleLogPeriod}
                    class="w-12 h-12 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center -mt-6 hover:bg-purple-700 active:scale-95 transition-all group mx-1"
                >
                    <Plus class="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
                <button
                    onclick={() => activeTab = 'insights'}
                    class="flex-1 flex flex-col items-center py-2 transition-all {activeTab === 'insights' ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <LayoutGrid class="w-5 h-5 mb-1" />
                    <span class="text-[9px] font-bold uppercase tracking-tighter">{i18n.t('insights')}</span>
                </button>
                <button
                    onclick={() => showGuides = true}
                    class="flex-1 flex flex-col items-center py-2 transition-all {showGuides ? 'text-purple-600' : 'text-gray-400'}"
                >
                    <BookOpen class="w-5 h-5 mb-1" />
                    <span class="text-[9px] font-bold uppercase tracking-tighter">{i18n.t('guides')}</span>
                </button>
            </div>
        </nav>
    </div>
{/if}
