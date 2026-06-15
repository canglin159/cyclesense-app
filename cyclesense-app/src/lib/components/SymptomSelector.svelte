<script>
    import { appState } from '$lib/stores/appState.svelte.js';
    import { X } from '@lucide/svelte';
    import { fly, fade } from 'svelte/transition';

    let { date, onclose } = $props();

    const symptomCategories = [
        { name: 'Flow', type: 'flow', options: [
            { emoji: '💧', label: 'Light' },
            { emoji: '🩸', label: 'Medium' },
            { emoji: '🩸🩸', label: 'Heavy' },
            { emoji: '🩸🩸🩸', label: 'Super' }
        ]},
        { name: 'Symptoms', type: 'symptom', options: [
            { emoji: '⚡', label: 'Cramps' },
            { emoji: '🎈', label: 'Bloating' },
            { emoji: '💆', label: 'Headache' },
            { emoji: '😫', label: 'Backache' }
        ]},
        { name: 'Mood', type: 'mood', options: [
            { emoji: '😊', label: 'Happy' },
            { emoji: '😐', label: 'Neutral' },
            { emoji: '😔', label: 'Sad' },
            { emoji: '😠', label: 'Angry' }
        ]},
        { name: 'Energy', type: 'energy', options: [
            { emoji: '🔋', label: 'High' },
            { emoji: '🔌', label: 'Normal' },
            { emoji: '🪫', label: 'Low' },
            { emoji: '😴', label: 'Tired' }
        ]}
    ];

    let selectedSymptoms = $state([]);

    $effect(() => {
        selectedSymptoms = appState.dayLogs[date]?.symptoms || [];
    });

    function toggleSymptom(emoji, type) {
        const index = selectedSymptoms.findIndex(s => s.type === type && s.emoji === emoji);
        if (index !== -1) {
            selectedSymptoms = selectedSymptoms.filter((_, i) => i !== index);
        } else {
            // For flow, mood, energy - usually only one allowed per category in this simple UI
            if (['flow', 'mood', 'energy'].includes(type)) {
                selectedSymptoms = selectedSymptoms.filter(s => s.type !== type);
            }
            selectedSymptoms = [...selectedSymptoms, { emoji, type }];
        }
        appState.updateDayLog(date, selectedSymptoms);
    }

    function isSelected(emoji, type) {
        return selectedSymptoms.some(s => s.type === type && s.emoji === emoji);
    }
</script>

<div 
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
    transition:fade
>
    <div 
        class="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
        transition:fly={{ y: 100, duration: 300 }}
    >
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-2xl font-bold text-gray-800">How are you?</h3>
                <p class="text-purple-500 font-medium">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onclick={onclose} class="p-2 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors">
                <X class="w-6 h-6" />
            </button>
        </div>

        <div class="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {#each symptomCategories as category}
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{category.name}</h4>
                    <div class="grid grid-cols-4 gap-3">
                        {#each category.options as option}
                            <button 
                                onclick={() => toggleSymptom(option.emoji, category.type)}
                                class="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95
                                    {isSelected(option.emoji, category.type) 
                                        ? 'border-purple-500 bg-purple-50 text-purple-600' 
                                        : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}
                                "
                            >
                                <span class="text-2xl">{option.emoji}</span>
                                <span class="text-[10px] font-bold">{option.label}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>

        <button 
            onclick={onclose}
            class="w-full bg-purple-500 text-white font-bold py-4 rounded-2xl mt-8 shadow-lg shadow-purple-200 hover:bg-purple-600 active:scale-[0.98] transition-all"
        >
            Done
        </button>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #f3f4f6;
        border-radius: 10px;
    }
</style>
