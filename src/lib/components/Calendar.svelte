<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { premiumStore } from '$lib/stores/premiumStore.svelte.js';
    import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Droplets, Info } from '@lucide/svelte';
    import SymptomSelector from './SymptomSelector.svelte';
    import AdBanner from './AdBanner.svelte';
    import { Share2, ShieldCheck } from '@lucide/svelte';

    let { onsafeshare } = $props();
    let currentMonth = $state(new Date());
    let selectedDate = $state(null);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let days = $derived.by(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        
        const daysArray = [];

        // Padding for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            daysArray.push(null);
        }

        const predictionsToShow = premiumStore.isPremium ? appState.forecast : [appState.prediction];

        for (let i = 1; i <= lastDateOfMonth; i++) {
            const date = new Date(year, month, i);
            const dateString = formatDate(date);
            
            const isPredictedPeriod = predictionsToShow.some(p => isDateInRange(dateString, p.nextPeriodStart, p.nextPeriodEnd));
            const isPredictedOvulation = predictionsToShow.some(p => dateString === p.ovulationDate);
            const isPredictedFertile = predictionsToShow.some(p => isDateInRange(dateString, p.fertileWindowStart, p.fertileWindowEnd));

            daysArray.push({
                date,
                dateString,
                isToday: dateString === formatDate(new Date()),
                isPeriod: isPredictedPeriod,
                isOvulation: isPredictedOvulation,
                isFertile: isPredictedFertile,
                isLoggedPeriod: appState.cycles.some(c => isDateInRange(dateString, c.periodStart, c.periodEnd)),
                symptoms: appState.dayLogs[dateString]?.symptoms || []
            });
        }

        return daysArray;
    });

    function formatDate(date) {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function isDateInRange(date, start, end) {
        if (!start || !end) return false;
        return date >= start && date <= end;
    }

    function changeMonth(delta) {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    }
</script>

<div class="space-y-6">
    <div class="w-full bg-white rounded-3xl shadow-xl overflow-hidden p-6">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
            </h2>
            <div class="flex gap-2">
                <button onclick={() => changeMonth(-1)} class="p-2 hover:bg-purple-50 rounded-xl transition-colors">
                    <ChevronLeft class="w-5 h-5 text-purple-500" />
                </button>
                <button onclick={() => changeMonth(1)} class="p-2 hover:bg-purple-50 rounded-xl transition-colors">
                    <ChevronRight class="w-5 h-5 text-purple-500" />
                </button>
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-4">
            {#each daysOfWeek as day}
                <div class="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2">
                    {day}
                </div>
            {/each}
            
            {#each days as day}
                <button 
                    class="aspect-square flex items-center justify-center relative hover:scale-110 transition-transform active:scale-95"
                    onclick={() => day && (selectedDate = day.dateString)}
                >
                    {#if day}
                        <div class="
                            w-10 h-10 flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all
                            {day.isToday ? 'border-2 border-purple-500 text-purple-600' : 'text-gray-700'}
                            {day.isLoggedPeriod ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : ''}
                            {day.isPeriod && !day.isLoggedPeriod ? 'bg-rose-100 text-rose-600' : ''}
                            {day.isFertile ? 'bg-teal-50 text-teal-600' : ''}
                            {day.isOvulation ? 'ring-2 ring-teal-400' : ''}
                        ">
                            <span>{day.date.getDate()}</span>
                            <div class="flex gap-0.5 mt-0.5">
                                {#each day.symptoms.slice(0, 3) as symptom}
                                    <span class="text-[8px]">{symptom.emoji}</span>
                                {/each}
                            </div>
                        </div>
                        {#if day.isOvulation}
                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-white"></div>
                        {/if}
                    {/if}
                </button>
            {/each}
        </div>

        {#if selectedDate}
            <SymptomSelector 
                date={selectedDate} 
                onclose={() => selectedDate = null} 
            />
        {/if}

        <div class="mt-8 grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Droplets class="w-4 h-4 text-white" />
                </div>
                <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Next Period</p>
                    <p class="text-sm font-bold text-gray-800">{appState.prediction.nextPeriodStart || 'N/A'}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div class="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
                    <CalendarIcon class="w-4 h-4 text-white" />
                </div>
                <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Fertile Window</p>
                    <p class="text-sm font-bold text-gray-800">{appState.prediction.fertileWindowStart ? 'Starts soon' : 'N/A'}</p>
                </div>
            </div>
        </div>

        {#if appState.prediction.confidence}
            <div class="mt-6 flex items-center justify-between gap-2 bg-blue-50 p-3 rounded-xl">
                <div class="flex items-center gap-2">
                    <Info class="w-4 h-4 text-blue-400" />
                    <p class="text-xs text-blue-700 font-medium">
                        Prediction confidence: <span class="capitalize font-bold">{appState.prediction.confidence}</span>
                    </p>
                </div>
                {#if appState.featureFlags.bayesianModel}
                    <div class="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full border border-blue-100">
                        <span class="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Sovereignty Engine</span>
                    </div>
                {/if}
            </div>
        {/if}
        <div class="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                <ShieldCheck class="w-3 h-3" /> Zero Knowledge Share
            </div>
            <button 
                onclick={onsafeshare}
                class="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95"
            >
                <Share2 class="w-3 h-3" />
                Share Status
            </button>
        </div>
    </div>

    <AdBanner />
</div>
