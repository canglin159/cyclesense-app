<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { fade, slide } from 'svelte/transition';
    import { ShieldCheck, X } from '@lucide/svelte';

    let { onclose } = $props();

    async function handleOptIn(choice) {
        await appState.updateSetting('analyticsOptIn', choice);
        if (choice) {
            await appState.recordEvent('onboarding_complete', { opted_in: true });
        }
        onclose();
    }
</script>

<div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6" transition:fade>
    <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onclick={() => handleOptIn(false)}></div>
    
    <div class="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden" transition:slide={{ axis: 'y' }}>
        <div class="p-8 pt-10 text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck class="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 class="text-2xl font-black text-gray-900 mb-3">Help us improve</h2>
            <p class="text-gray-600 leading-relaxed mb-8">
                We'd like to collect anonymous usage data to improve our predictions. 
                <span class="font-bold text-purple-600">No personal information (PII) is ever collected or stored.</span>
                Your data stays private and anonymous.
            </p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                    onclick={() => handleOptIn(true)}
                    class="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 active:scale-[0.98] transition-all"
                >
                    Yes, help improve
                </button>
                <button 
                    onclick={() => handleOptIn(false)}
                    class="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                    No thanks
                </button>
            </div>
        </div>
        
        <button 
            onclick={() => handleOptIn(false)}
            class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <X class="w-6 h-6" />
        </button>
    </div>
</div>
