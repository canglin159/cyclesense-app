<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { Calendar, CheckCircle2, AlertCircle, ChevronRight, Trash2 } from '@lucide/svelte';
    import AdBanner from './AdBanner.svelte';

    function calculateCycleLength(cycle, index) {
        if (index === appState.cycles.length - 1) return null;
        const currentStart = new Date(cycle.periodStart);
        const prevStart = new Date(appState.cycles[index + 1].periodStart);
        return Math.round((currentStart - prevStart) / (1000 * 60 * 60 * 24));
    }

    function getDuration(cycle) {
        const start = new Date(cycle.periodStart);
        const end = new Date(cycle.periodEnd);
        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    function formatDate(dateStr) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function getAccuracy(cycle) {
        const prediction = appState.predictions.find(p => p.actualPeriodStart === cycle.periodStart);
        if (!prediction) return null;

        const actualDate = new Date(cycle.periodStart);
        const predictedDate = new Date(prediction.nextPeriodStart);
        const diff = Math.abs(Math.round((actualDate - predictedDate) / (1000 * 60 * 60 * 24)));
        return diff;
    }

    function getAverageAccuracy() {
        if (appState.predictions.length === 0) return null;
        const diffs = appState.predictions.map(p => {
            const actualDate = new Date(p.actualPeriodStart);
            const predictedDate = new Date(p.nextPeriodStart);
            return Math.abs(Math.round((actualDate - predictedDate) / (1000 * 60 * 60 * 24)));
        });
        return (diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1);
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Cycle History</h2>
        <div class="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
            {appState.cycles.length} Cycles Logged
        </div>
    </div>

    {#if appState.cycles.length === 0}
        <div class="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
            <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar class="w-6 h-6 text-gray-300" />
            </div>
            <p class="text-gray-500 text-sm">No cycles logged yet. Start by logging your current or past period.</p>
        </div>
    {:else}
        <div class="space-y-3">
            {#each appState.cycles as cycle, i}
                {@const cycleLength = calculateCycleLength(cycle, i)}
                {@const accuracy = getAccuracy(cycle)}
                {@const dayLog = appState.dayLogs[cycle.periodStart]}
                <div class="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 hover:border-rose-200 transition-colors group">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="text-sm font-bold text-gray-800">{formatDate(cycle.periodStart)}</p>
                            <p class="text-xs text-gray-400">{getDuration(cycle)} days duration</p>
                        </div>
                        
                        <div class="text-right">
                            {#if cycleLength}
                                <p class="text-sm font-bold text-rose-500">{cycleLength} days</p>
                                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Cycle</p>
                            {/if}
                            {#if accuracy !== null}
                                <p class="text-[10px] mt-1 font-bold {accuracy <= 1 ? 'text-teal-500' : 'text-orange-400'}">
                                    {accuracy === 0 ? 'Perfect match' : `±${accuracy} day accuracy`}
                                </p>
                            {/if}
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div class="flex gap-2">
                            {#if dayLog && dayLog.symptoms && dayLog.symptoms.length > 0}
                                {#each dayLog.symptoms.slice(0, 4) as symptom}
                                    <span class="text-lg" title={symptom.type}>{symptom.emoji}</span>
                                {/each}
                            {:else}
                                <span class="text-[10px] text-gray-300 font-medium">No symptoms logged</span>
                            {/if}
                        </div>

                        <div class="flex items-center gap-3">
                            <button 
                                onclick={() => appState.deleteCycle(cycle.id)}
                                class="p-2 text-gray-300 hover:text-red-400 transition-colors"
                            >
                                <Trash2 class="w-4 h-4" />
                            </button>
                            <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Accuracy Feedback Loop -->
    {#if appState.predictions.length > 0}
        {@const avgAcc = getAverageAccuracy()}
        <div class="bg-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-200">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 class="font-bold mb-1">Prediction Insights</h3>
                    <p class="text-rose-100 text-xs leading-relaxed">
                        {#if avgAcc <= 1}
                            Our predictions are highly accurate for your cycle (avg. ±{avgAcc} days).
                        {:else if avgAcc <= 3}
                            We're learning your patterns. Accuracy is currently ±{avgAcc} days.
                        {:else}
                            Your cycles vary a bit. We'll keep adapting to improve our ±{avgAcc} day accuracy.
                        {/if}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <AdBanner />
</div>
