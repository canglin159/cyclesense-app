<script>
    import { fade } from 'svelte/transition';
</script>

<svelte:head>
    <title>Privacy Policy - CycleSense</title>
</svelte:head>

<div class="min-h-screen bg-[#f5f3ff] p-6 sm:p-12 text-[#4c1d95]" in:fade>
    <div class="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-[32px] shadow-sm border border-purple-100">
        <header class="mb-12">
            <h1 class="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p class="text-purple-500 italic">Last updated: June 2026</p>
        </header>

        <div class="prose prose-purple prose-lg">
            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">1. Data We Collect</h2>
                <p>
                    <strong>Health Data (Period & Cycle):</strong> Stored locally on YOUR device via IndexedDB.
                    We do not have servers that store your menstrual data. It never leaves your device
                    unless you explicitly choose to share an encrypted report via "Safe Share."
                </p>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">2. Analytics (Opt-In)</h2>
                <p>We may collect anonymous usage data if you opt in. This includes:</p>
                <ul class="list-disc pl-6 mb-4">
                    <li>Event types (page views, feature usage)</li>
                    <li>One-way hashed client identifier (cannot be reversed to identify you)</li>
                    <li>Aggregated performance metrics</li>
                </ul>
                <p>You can opt out anytime in Settings.</p>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">3. Advertising</h2>
                <ul class="list-disc pl-6 mb-4">
                    <li>Free tier displays ads via EthicalAds, a privacy-first ad network.</li>
                    <li>EthicalAds does NOT use tracking cookies or personal data.</li>
                    <li>Premium subscribers see no ads.</li>
                </ul>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">4. Payments</h2>
                <ul class="list-disc pl-6 mb-4">
                    <li>Premium subscriptions are processed by Stripe.</li>
                    <li>We never see or store your credit card details.</li>
                    <li>Stripe's privacy policy applies to payment data.</li>
                </ul>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">5. Data Sharing</h2>
                <ul class="list-disc pl-6 mb-4">
                    <li>We do not sell, rent, or share your personal data.</li>
                    <li>We do not use third-party analytics (no Google Analytics, no Mixpanel).</li>
                    <li>We do not use tracking pixels or fingerprinting.</li>
                </ul>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">6. Your Rights</h2>
                <ul class="list-disc pl-6 mb-4">
                    <li>Since we don't have your data, there's nothing to delete or export.</li>
                    <li>You can clear your local data from app settings at any time.</li>
                    <li>Your cycle data is subpoena-proof because we don't possess it.</li>
                </ul>
            </section>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4">7. Contact</h2>
                <p>Email: <a href="mailto:privacy@cyclesense.app" class="underline font-semibold">privacy@cyclesense.app</a></p>
            </section>
        </div>

        <footer class="mt-16 pt-8 border-t border-purple-50 text-center">
            <a href="/" class="inline-block px-8 py-3 bg-[#9333ea] text-white rounded-full font-bold hover:bg-[#7e22ce] transition-colors shadow-lg shadow-purple-200">
                Back to App
            </a>
        </footer>
    </div>
</div>
