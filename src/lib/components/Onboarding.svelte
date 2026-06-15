<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { Heart, ArrowRight } from '@lucide/svelte';

    let lastPeriodStart = $state('');
    let periodLength = $state(5);
    let step = $state(1);

    async function handleNext() {
        if (step === 1) {
            if (!lastPeriodStart) return;
            step = 2;
        } else {
            await appState.completeOnboarding(lastPeriodStart, periodLength);
        }
    }
</script>

<div class="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Heart class="w-8 h-8 text-purple-600 fill-purple-600" />
        </div>

        {#if step === 1}
            <h1 class="text-2xl font-bold text-gray-800 mb-2 text-center">Welcome to CycleSense</h1>
            <p class="text-gray-500 text-center mb-8 leading-relaxed">
                To get started, when did your last period begin?
            </p>

            <div class="w-full mb-8">
                <label for="lastPeriod" class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input 
                    type="date" 
                    id="lastPeriod" 
                    bind:value={lastPeriodStart}
                    max={new Date().toISOString().split('T')[0]}
                    class="w-full px-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
            </div>
        {:else}
            <h1 class="text-2xl font-bold text-gray-800 mb-2 text-center">Just one more thing</h1>
            <p class="text-gray-500 text-center mb-8 leading-relaxed">
                How many days does your period usually last?
            </p>

            <div class="w-full mb-8">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-medium text-gray-700">Duration</span>
                    <span class="text-lg font-bold text-purple-600">{periodLength} days</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    bind:value={periodLength}
                    class="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div class="flex justify-between mt-2 px-1">
                    <span class="text-xs text-gray-400 font-medium">1</span>
                    <span class="text-xs text-gray-400 font-medium">10</span>
                </div>
            </div>
        {/if}

        <button 
            onclick={handleNext}
            disabled={step === 1 && !lastPeriodStart}
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
        >
            {step === 1 ? 'Next' : 'Start Tracking'}
            <ArrowRight class="w-5 h-5" />
        </button>

        <div class="mt-8 flex gap-2">
            <div class="w-2 h-2 rounded-full {step === 1 ? 'bg-purple-600 w-6' : 'bg-purple-200'} transition-all duration-300"></div>
            <div class="w-2 h-2 rounded-full {step === 2 ? 'bg-purple-600 w-6' : 'bg-purple-200'} transition-all duration-300"></div>
        </div>
    </div>
</div>

<style>
    /* Range input styling for a cleaner look */
    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        background: #9333ea;
        border-radius: 50%;
        cursor: pointer;
        border: 4px solid white;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
</style>
