<script>
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { syncService } from '$lib/services/sync';
    import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from '@lucide/svelte';

    let syncStatus = $state('idle'); // idle, syncing, success, error
    let lastSync = $state(null);

    async function handleSync() {
        if (!premiumStore.isPremium) return;
        
        syncStatus = 'syncing';
        const result = await syncService.sync('anonymous-user-id');
        
        if (result.success) {
            syncStatus = 'success';
            lastSync = new Date(result.timestamp).toLocaleTimeString();
            setTimeout(() => syncStatus = 'idle', 3000);
        } else {
            syncStatus = 'error';
        }
    }
</script>

<div class="bg-white rounded-3xl p-6 shadow-sm border border-purple-100">
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center {premiumStore.isPremium ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}">
                {#if !premiumStore.isPremium}
                    <CloudOff class="w-5 h-5" />
                {:else if syncStatus === 'syncing'}
                    <RefreshCw class="w-5 h-5 animate-spin" />
                {:else}
                    <Cloud class="w-5 h-5" />
                {/if}
            </div>
            <div>
                <h3 class="font-bold text-gray-900">Cloud Sync</h3>
                <p class="text-xs text-gray-500">
                    {#if !premiumStore.isPremium}
                        Premium feature
                    {:else if lastSync}
                        Last synced at {lastSync}
                    {:else}
                        Backup your data
                    {/if}
                </p>
            </div>
        </div>

        {#if premiumStore.isPremium}
            <button 
                onclick={handleSync}
                disabled={syncStatus === 'syncing'}
                class="px-4 py-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
                {#if syncStatus === 'syncing'}
                    Syncing...
                {:else if syncStatus === 'success'}
                    <CheckCircle2 class="w-4 h-4" />
                {:else if syncStatus === 'error'}
                    <AlertCircle class="w-4 h-4" />
                {:else}
                    Sync Now
                {/if}
            </button>
        {:else}
            <button 
                disabled
                class="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-xl"
            >
                Locked
            </button>
        {/if}
    </div>

    {#if !premiumStore.isPremium}
        <p class="text-xs text-gray-400 leading-relaxed">
            Upgrade to Premium to enable encrypted cloud backup and sync your data across all your devices.
        </p>
    {/if}
</div>
