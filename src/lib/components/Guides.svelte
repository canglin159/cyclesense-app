<script>
    import { guides } from '$lib/data/guides.js';
    import { i18n } from '$lib/stores/i18nStore.svelte.js';
    import { 
        ChevronLeft, 
        ChevronRight, 
        BookOpen, 
        Shield, 
        Apple, 
        FileText, 
        Activity,
        X
    } from '@lucide/svelte';
    import { fade, fly } from 'svelte/transition';

    let { onclose } = $props();
    let selectedGuide = $state(null);

    const icons = {
        BookOpen,
        Shield,
        Apple,
        FileText,
        Activity
    };

    function parseMarkdown(text) {
        // Very basic markdown to "something renderable"
        return text.split('\n').filter(line => line.trim() !== '');
    }
</script>

<div class="fixed inset-0 z-[200] bg-white flex flex-col font-sans" in:fly={{ y: 200, duration: 400 }} out:fly={{ y: 200, duration: 300 }}>
    <!-- Header -->
    <header class="px-6 pt-12 pb-4 flex items-center justify-between border-b border-purple-50">
        {#if selectedGuide}
            <div class="flex items-center gap-2">
                <button onclick={() => selectedGuide = null} class="p-2 -ml-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <ChevronLeft class="w-6 h-6" />
                </button>
                <h2 class="text-lg font-bold text-gray-800 line-clamp-1">{selectedGuide.title}</h2>
            </div>
        {:else}
            <h2 class="text-2xl font-black text-gray-800 tracking-tight">{i18n.t('guides')}</h2>
            <button onclick={onclose} class="p-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors">
                <X class="w-6 h-6" />
            </button>
        {/if}
    </header>

    <div class="flex-1 overflow-y-auto">
        {#if selectedGuide}
            <article class="px-6 py-8" in:fade>
                {#each parseMarkdown(selectedGuide.content) as line}
                    {#if line.startsWith('# ')}
                        <!-- Already in title, skip or show as h1 -->
                    {:else if line.startsWith('## ')}
                        <h2 class="text-xl font-bold mt-8 mb-4 text-gray-800 border-b border-purple-50 pb-2">{line.replace('## ', '')}</h2>
                    {:else if line.startsWith('### ')}
                        <h3 class="text-lg font-bold mt-6 mb-3 text-gray-700">{line.replace('### ', '')}</h3>
                    {:else if line.trim() === '---'}
                        <hr class="my-8 border-purple-100" />
                    {:else if line.startsWith('* ') || line.startsWith('- ')}
                        <div class="flex gap-2 mb-2 ml-2">
                            <div class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                            <p class="text-gray-600 leading-relaxed">{line.replace(/^[*|-]\s+/, '')}</p>
                        </div>
                    {:else}
                        <p class="text-gray-600 leading-relaxed mb-4">{line}</p>
                    {/if}
                {/each}
                
                <div class="mt-12 p-6 bg-purple-50 rounded-3xl text-center">
                    <p class="text-sm text-purple-600 font-medium mb-4">Was this guide helpful?</p>
                    <button class="bg-white text-purple-600 px-6 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-all">
                        Share with a friend
                    </button>
                </div>
            </article>
        {:else}
            <div class="p-6 space-y-4" in:fade>
                {#each guides as guide}
                    {@const Icon = icons[guide.icon] || BookOpen}
                    <button 
                        onclick={() => selectedGuide = guide}
                        class="w-full bg-white border border-purple-50 hover:border-purple-100 p-5 rounded-[32px] flex items-center gap-4 transition-all text-left group shadow-sm hover:shadow-md"
                    >
                        <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon class="w-6 h-6 text-purple-600" />
                        </div>
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-800 text-sm leading-tight">{guide.title}</h3>
                            <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Read Guide</p>
                        </div>
                        <ChevronRight class="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>
