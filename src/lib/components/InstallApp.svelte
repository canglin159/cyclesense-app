<script>
    import { fade, slide } from 'svelte/transition';
    import { X, Smartphone, Apple, Download, Share, PlusSquare, ChevronRight } from '@lucide/svelte';

    let { onclose } = $props();
    let activePlatform = $state('ios'); // 'ios' or 'android'

    const iosSteps = [
        {
            text: 'Tap the Share button in Safari',
            icon: Share
        },
        {
            text: 'Scroll down and tap "Add to Home Screen"',
            icon: PlusSquare
        },
        {
            text: 'Tap "Add" in the top right corner',
            icon: ChevronRight
        }
    ];
</script>

<div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6" in:fade>
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-purple-900/40 backdrop-blur-sm" onclick={onclose}></div>

    <!-- Modal -->
    <div 
        class="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        in:slide={{ axis: 'y' }}
    >
        <div class="p-6 sm:p-8 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                        <Smartphone class="w-6 h-6" />
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Install App</h2>
                        <p class="text-sm text-gray-500 font-medium">Get CycleSense on your phone</p>
                    </div>
                </div>
                <button 
                    onclick={onclose}
                    class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex p-1 bg-gray-100 rounded-2xl mb-8">
                <button 
                    class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all {activePlatform === 'ios' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                    onclick={() => activePlatform = 'ios'}
                >
                    <Apple class="w-4 h-4" />
                    iOS
                </button>
                <button 
                    class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all {activePlatform === 'android' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                    onclick={() => activePlatform = 'android'}
                >
                    <Smartphone class="w-4 h-4" />
                    Android
                </button>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {#if activePlatform === 'ios'}
                    <div in:fade={{ duration: 200 }}>
                        <h3 class="font-bold text-gray-900 mb-4">How to install on iOS:</h3>
                        <div class="space-y-4">
                            {#each iosSteps as step, i}
                                <div class="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-purple-600 font-black shadow-sm flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-gray-800 font-medium leading-tight mb-2">{step.text}</p>
                                        <div class="flex items-center gap-1 text-purple-400">
                                            <step.icon class="w-4 h-4" />
                                            <span class="text-[10px] font-black uppercase tracking-widest">Safari Browser</span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div in:fade={{ duration: 200 }} class="text-center py-4">
                        <div class="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-6">
                            <Download class="w-10 h-10" />
                        </div>
                        <h3 class="text-xl font-black text-gray-900 mb-2">Direct APK Download</h3>
                        <p class="text-gray-500 mb-8 max-w-xs mx-auto">Download the Android app directly to your device for a full native experience.</p>
                        
                        <a 
                            href="/cyclesense-v1.0.1.apk" 
                            download 
                            class="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all w-full justify-center mb-4"
                        >
                            <Download class="w-5 h-5" />
                            Download Android App
                        </a>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Version 1.0.1 • 13.0 MB</p>
                    </div>
                {/if}
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100 text-center">
                <p class="text-xs text-gray-400 font-medium">CycleSense is a privacy-first Progressive Web App</p>
            </div>
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
</style>
