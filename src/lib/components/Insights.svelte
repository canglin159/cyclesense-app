<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { Sparkles, Calendar, TrendingUp, Lock, ChevronRight, Share2, ShieldCheck } from '@lucide/svelte';
    import SyncStatus from './SyncStatus.svelte';
    import { fade } from 'svelte/transition';

    let { onrequestupgrade, onsafeshare } = $props();

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
</script>

<div class="space-y-6 pb-10">
    <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Insights</h2>
        {#if !premiumStore.isPremium}
            <button 
                onclick={onrequestupgrade}
                class="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-purple-100 hover:scale-105 transition-transform"
            >
                <Sparkles class="w-3 h-3 fill-white" />
                Upgrade
            </button>
        {/if}
    </div>

    <!-- Cloud Sync Status -->
    <SyncStatus />

    <!-- 6-Month Forecast Section -->
    <div class="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Calendar class="w-5 h-5 text-purple-500" />
            </div>
            <div>
                <h3 class="font-bold text-gray-800 text-sm">6-Month Forecast</h3>
                <p class="text-[11px] text-gray-400">Predicted future cycle dates</p>
            </div>
        </div>

        <div class="space-y-4">
            {#if premiumStore.isPremium}
                {#each appState.forecast.slice(0, 6) as cycle}
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-bold text-purple-500 shadow-sm">
                                {new Date(cycle.nextPeriodStart).getMonth() + 1}
                            </div>
                            <span class="text-sm font-medium text-gray-700">{formatDate(cycle.nextPeriodStart)} - {formatDate(cycle.nextPeriodEnd)}</span>
                        </div>
                        <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {cycle.confidence} confidence
                        </div>
                    </div>
                {/each}
            {:else}
                <!-- Blurred Mockup for Non-Premium -->
                <div class="space-y-4 relative">
                    {#each Array(3) as _, i}
                        <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl blur-[2px] opacity-40">
                            <div class="w-32 h-4 bg-gray-200 rounded-full"></div>
                            <div class="w-16 h-3 bg-gray-200 rounded-full"></div>
                        </div>
                    {/each}
                    
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div class="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3">
                            <Lock class="w-6 h-6 text-purple-400" />
                        </div>
                        <h4 class="font-bold text-gray-800 mb-1">Premium Only</h4>
                        <p class="text-[11px] text-gray-400 max-w-[160px] mb-4">Plan ahead with our 6-month cycle forecasting engine.</p>
                        <button 
                            onclick={onrequestupgrade}
                            class="text-xs font-bold text-purple-500 hover:text-purple-600 transition-colors"
                        >
                            Unlock Forecasts
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        <div class="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <ShieldCheck class="w-3 h-3" /> Secure Sharing
            </div>
            <button 
                onclick={onsafeshare}
                class="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95"
            >
                <Share2 class="w-3 h-3" />
                Share Forecast
            </button>
        </div>
    </div>

    <!-- Cycle Trends Section -->
    <div class="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <TrendingUp class="w-5 h-5 text-indigo-500" />
            </div>
            <div>
                <h3 class="font-bold text-gray-800 text-sm">Cycle Trends</h3>
                <p class="text-[11px] text-gray-400">Length and duration patterns</p>
            </div>
        </div>

        {#if premiumStore.isPremium}
            <div class="h-40 flex items-end justify-between gap-2 px-2">
                {#if appState.cycles.length > 0}
                    {#each appState.cycles.slice(0, 7).reverse() as cycle, i}
                        {@const length = i > 0 ? Math.round((new Date(cycle.periodStart) - new Date(appState.cycles.slice(0, 7).reverse()[i-1].periodStart)) / (1000 * 60 * 60 * 24)) : 28}
                        <div class="flex-1 flex flex-col items-center gap-2 group">
                            <div 
                                class="w-full bg-indigo-100 rounded-t-lg relative transition-all group-hover:bg-indigo-200"
                                style="height: {(length / 40) * 100}%"
                            >
                                <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {length}d
                                </div>
                            </div>
                            <span class="text-[8px] font-bold text-gray-300 uppercase truncate w-full text-center">
                                {new Date(cycle.periodStart).toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                        </div>
                    {/each}
                {:else}
                    <div class="w-full h-full flex items-center justify-center">
                        <p class="text-xs text-gray-300 italic">Not enough data to show trends</p>
                    </div>
                {/if}
            </div>
        {:else}
            <div class="h-40 flex flex-col items-center justify-center text-center p-6 relative">
                 <div class="flex items-end justify-between gap-2 px-2 w-full absolute inset-0 blur-[3px] opacity-20 p-6 pointer-events-none">
                    {#each Array(6) as _, i}
                        <div class="flex-1 bg-indigo-200 rounded-t-lg" style="height: {40 + Math.random() * 50}%"></div>
                    {/each}
                </div>
                <div class="relative z-10">
                    <div class="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-3">
                        <Lock class="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 class="font-bold text-gray-800 mb-1">Advanced Analytics</h4>
                    <p class="text-[11px] text-gray-400 max-w-[160px] mb-4">Visualize changes in your cycle length over time.</p>
                </div>
            </div>
        {/if}
    </div>

    <!-- Health Profile Section (Locked) -->
    <div class="bg-gray-900 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div class="flex items-center justify-between mb-8 relative z-10">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Sparkles class="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 class="font-bold text-white text-sm">Premium Profile</h3>
                    <p class="text-[11px] text-gray-400">Exclusive member health report</p>
                </div>
            </div>
            {#if !premiumStore.isPremium}
                <Lock class="w-4 h-4 text-gray-600" />
            {/if}
        </div>

        <button 
            onclick={onrequestupgrade}
            class="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
        >
            <div class="text-left">
                <p class="text-xs font-bold text-white mb-1">Export Data</p>
                <p class="text-[10px] text-gray-500">PDF report for your doctor</p>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
        </button>
    </div>
</div>
