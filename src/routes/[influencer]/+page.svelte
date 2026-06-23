<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.js';

  let { data } = $props();
  let influencer = $derived(data.influencer);
  let keysRemaining = $derived(data.keysRemaining);
  let keyStatus = $state('idle'); // 'idle' | 'claiming' | 'claimed' | 'exhausted' | 'error'
  let claimedKey = $state(null);

  onMount(async () => {
    await appState.init();
  });

  async function claimGoldKey() {
    if (keysRemaining <= 0) {
      keyStatus = 'exhausted';
      return;
    }
    keyStatus = 'claiming';
    
    let userId = appState.settings.userId;
    if (!userId) {
        await appState.init();
        userId = appState.settings.userId;
    }

    try {
      const res = await fetch('/api/influencer/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: influencer.slug,
          userId: userId
        })
      });
      const result = await res.json();
      if (result.success) {
        keyStatus = 'claimed';
        claimedKey = result;
        // Apply Gold Key entitlement locally
        await appState.updateSetting('goldKey', JSON.stringify(result));
        
        // Track analytics event
        await appState.recordEvent('gold_key_claim', { 
            influencer_slug: influencer.slug,
            source_type: 'influencer_page'
        });
      } else {
        keyStatus = result.reason === 'exhausted' ? 'exhausted' : 'error';
      }
    } catch (err) {
      console.error('Claim error:', err);
      keyStatus = 'error';
    }
  }
</script>

<div class="influencer-landing">
  <header class="hero">
    <div class="container">
      {#if influencer.photo_url}
        <img src={influencer.photo_url} alt={influencer.name} class="profile-pic" />
      {/if}
      <h1>{influencer.name} recommends CycleSense</h1>
      <p class="tagline">The privacy-first period tracker for the sovereignty-minded.</p>
    </div>
  </header>

  <main class="container">
    <section class="value-prop">
      <div class="card">
        <ul>
          <li>✨ <strong>Minimal onboarding</strong> — Start tracking in seconds.</li>
          <li>🔒 <strong>No data harvesting</strong> — Your data stays on your device.</li>
          <li>🛡️ <strong>Private by design</strong> — Zero-knowledge sync for Pro users.</li>
        </ul>
      </div>
    </section>

    <section class="cta-section">
      {#if keyStatus === 'claimed'}
        <div class="success-card">
          <h2>Welcome to CycleSense Pro!</h2>
          <p>Your {influencer.name}-gifted Pro month is active.</p>
          <p class="expiry">Expires: {new Date(claimedKey.expiresAt).toLocaleDateString()}</p>
          <a href="/" class="btn btn-primary">Open App</a>
        </div>
      {:else if keyStatus === 'exhausted' || keysRemaining <= 0}
        <div class="exhausted-card">
          <h2>Keys Exhausted</h2>
          <p>All of {influencer.name}'s Gold Keys have been claimed.</p>
          <p>Use code <strong>{influencer.slug.toUpperCase()}10</strong> for 10% off your first year.</p>
          <a href="/" class="btn btn-secondary">Learn More</a>
        </div>
      {:else}
        <div class="claim-card">
          <h2>Claim Your Free Month</h2>
          <p>Exclusive for {influencer.name}'s community.</p>
          <button
            onclick={claimGoldKey}
            class="btn btn-claim"
            disabled={keyStatus === 'claiming'}
          >
            {keyStatus === 'claiming' ? 'Claiming...' : 'Claim Gold Key'}
          </button>
          <p class="small">{keysRemaining} keys left</p>
        </div>
      {/if}
    </section>

    <section class="social-proof">
      <p>Join 8,452 others taking control of their health data.</p>
    </section>
  </main>

  <footer class="container">
    <p>&copy; 2026 CycleSense. Total Privacy. No Exceptions.</p>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #fdf4ff;
    color: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .influencer-landing {
    text-align: center;
    padding-bottom: 4rem;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .hero {
    background: linear-gradient(135deg, #8B5CF6 0%, #ec4899 100%);
    color: white;
    padding: 4rem 0;
    margin-bottom: 2rem;
    border-bottom-left-radius: 3rem;
    border-bottom-right-radius: 3rem;
  }
  .profile-pic {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid white;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  }
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  .tagline {
    font-size: 1.1rem;
    opacity: 0.9;
  }
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    text-align: left;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    font-size: 1.05rem;
  }
  .cta-section {
    margin-bottom: 2rem;
  }
  .claim-card, .success-card, .exhausted-card {
    background: white;
    padding: 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 2px solid #ddd6fe;
  }
  .success-card {
    border-color: #10b981;
  }
  .btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: transform 0.1s;
    font-size: 1.1rem;
  }
  .btn:active {
    transform: scale(0.98);
  }
  .btn-claim {
    background-color: #ec4899;
    color: white;
    width: 100%;
    margin-top: 1rem;
  }
  .btn-primary {
    background-color: #8B5CF6;
    color: white;
  }
  .btn-secondary {
    background-color: #f3f4f6;
    color: #4b5563;
  }
  .small {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }
  .social-proof {
    color: #6b7280;
    font-style: italic;
  }
  footer {
    border-top: 1px solid #e5e7eb;
    margin-top: 4rem;
    color: #9ca3af;
    font-size: 0.875rem;
  }
</style>
