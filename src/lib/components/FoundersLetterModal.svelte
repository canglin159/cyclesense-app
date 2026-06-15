<script>
    import { onMount } from 'svelte';
    import { X, Share2, Sparkles, Heart } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';

    let { onclose, onopenshare } = $props();
    let visible = $state(false);

    onMount(() => {
        const hasSeen = localStorage.getItem('cs_founders_letter_seen');
        if (!hasSeen) {
            visible = true;
        }
    });

    function close() {
        localStorage.setItem('cs_founders_letter_seen', 'true');
        visible = false;
        onclose?.();
    }

    function handleShare() {
        localStorage.setItem('cs_founders_letter_seen', 'true');
        visible = false;
        onopenshare?.();
    }
</script>

{#if visible}
    <div 
        class="fixed inset-0 z-[100] flex items-center justify-center p-6"
        transition:fade={{ duration: 200 }}
    >
        <!-- Backdrop -->
        <div 
            class="absolute inset-0 bg-purple-900/40 backdrop-blur-sm" 
            onclick={close}
        ></div>

        <!-- Modal Content -->
        <div 
            class="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            transition:scale={{ duration: 300, start: 0.95 }}
        >
            <!-- Header -->
            <div class="p-6 pb-0 flex justify-end">
                <button 
                    onclick={close}
                    class="p-2 bg-purple-50 rounded-full text-purple-400 hover:text-purple-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <!-- Scrollable Body -->
            <div class="px-8 pb-8 overflow-y-auto custom-scrollbar">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <Heart class="text-purple-600 fill-purple-600" size={24} />
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-purple-900 leading-tight">A Letter to Our First 1,856 Users</h2>
                    </div>
                </div>

                <div class="prose prose-purple prose-sm leading-relaxed text-gray-600">
                    <p>Hi everyone,</p>
                    <p>I wanted to take a moment to say a massive <strong>thank you</strong>.</p>
                    <p>When we started CycleSense, we had a simple but radical idea: that your most intimate health data shouldn’t be a commodity. In a world of "pink-washed" apps that harvest your location, sell your history, and require endless accounts, we wanted to build something different. Something local-first. Something that respects you.</p>
                    
                    <div class="my-6 p-4 bg-purple-50 rounded-3xl border border-purple-100 italic font-medium text-purple-800">
                        Today, we’ve just crossed <span class="text-purple-600 font-black">1,856 users</span>.
                    </div>

                    <p>That might seem like a small number in the world of Big Tech, but to us, it’s 1,856 people who have chosen privacy over convenience, and minimalist utility over digital noise.</p>
                    
                    <h3 class="text-purple-900 font-black mt-6 mb-2 flex items-center gap-2">
                        <Sparkles size={18} class="text-purple-500" />
                        Why we need your help
                    </h3>
                    <p>We are currently in a "launch blitz" with a goal of reaching <strong>10,000 active users</strong> by the end of this month. We are committed to an organic-only growth strategy. We don't have a multi-million dollar ad budget because we aren't selling your data to pay for it.</p>
                    <p>Our growth depends entirely on people like you—the early adopters who understand why "local-first" matters.</p>

                    <h3 class="text-purple-900 font-black mt-6 mb-2">How you can support the mission</h3>
                    <p>If CycleSense has added value to your life, there are two simple ways you can help us reach our 10,000 user milestone:</p>
                    <ul class="space-y-3 mt-4">
                        <li class="flex gap-3">
                            <div class="mt-1 flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-black text-purple-600">1</div>
                            <span><strong>Share your 'Safe Share' link:</strong> Use the encrypted partner-sharing feature to stay in sync with your partner.</span>
                        </li>
                        <li class="flex gap-3">
                            <div class="mt-1 flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-black text-purple-600">2</div>
                            <span><strong>Spread the word:</strong> Share your experience with CycleSense in your favorite private communities (Discord, Matrix, Lemmy).</span>
                        </li>
                    </ul>

                    <div class="mt-8 p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-purple-200">
                        <h4 class="font-black text-lg mb-1 flex items-center gap-2">
                            The "Gold Key" Offer
                        </h4>
                        <p class="text-purple-100 text-xs mb-0 leading-normal">
                            As a final thank you, we are still offering <strong>Gold Key</strong> access ($19.99/yr) for the first 2,000 members. Help us stay independent.
                        </p>
                    </div>

                    <p class="mt-8 text-center text-gray-500 italic">
                        With gratitude,<br/>
                        <strong>The CycleSense Team</strong>
                    </p>
                </div>
            </div>

            <!-- CTA Footer -->
            <div class="p-6 bg-purple-50 border-t border-purple-100 flex flex-col gap-3">
                <button 
                    onclick={handleShare}
                    class="w-full py-4 bg-purple-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-[0.98] transition-all"
                >
                    <Share2 size={20} />
                    Open Safe Share
                </button>
                <button 
                    onclick={close}
                    class="w-full py-3 text-purple-600 font-bold text-sm hover:bg-purple-100 rounded-xl transition-colors"
                >
                    Maybe later
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #f5d0fe;
        border-radius: 10px;
    }
    .prose p {
        margin-bottom: 1rem;
    }
    .prose strong {
        color: #701a75;
    }
</style>
