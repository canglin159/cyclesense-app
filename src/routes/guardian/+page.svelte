<script>
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/appState.svelte.js';
  import { fade, slide } from 'svelte/transition';
  // Note: Lucide icons might need to be imported differently depending on the project setup
  // but I'll stick to the spec's design language.
  
  let loading = $state(true);
  let guardianData = $state(null);
  let generating = $state(false);
  let lastGeneratedKey = $state(null);

  async function refreshData() {
    if (!appState.settings.userId) return;
    try {
      const res = await fetch(`/api/guardian/generate-keys?userId=${appState.settings.userId}`);
      guardianData = await res.json();
    } catch (e) {
      console.error('Failed to fetch guardian data', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    // Small delay to ensure appState is ready
    setTimeout(() => {
      refreshData();
    }, 500);
  });

  async function generateKey() {
    if (generating) return;
    generating = true;
    try {
      const res = await fetch('/api/guardian/generate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appState.settings.userId })
      });
      const result = await res.json();
      if (result.success) {
        lastGeneratedKey = result;
        await refreshData();
      } else {
        alert(result.reason || 'Failed to generate key');
      }
    } catch (e) {
      console.error('Generation error', e);
    } finally {
      generating = false;
    }
  }

  function shareKey(code) {
    const url = `https://cyclesense.app/gift/${code}`;
    const text = `I'm giving you a free month of CycleSense Pro! Claim it here: ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'CycleSense Pro Gift',
        text: text,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  }
</script>

<div class="guardian-page">
  <div class="header-gradient">
    <div class="container">
      <a href="/" class="back-link">← Back to App</a>
      <div class="badge-hero">
        <div class="shield-container">
          <img src="/assets/icons/guardian_badge.svg" alt="Guardian Badge" class="w-16 h-16 mb-4" />
        </div>
        <h1>Community Guardian</h1>
        <p>Protecting privacy, sharing sovereignty.</p>
      </div>
    </div>
  </div>

  <main class="container">
    {#if loading}
      <div class="loading-state" in:fade>
        <div class="spinner"></div>
        <p>Loading Guardian status...</p>
      </div>
    {:else if !guardianData?.isGuardian && !appState.settings.isGuardian}
      <div class="not-guardian-card" in:fade>
        <h3>Become a Guardian</h3>
        <p>Community Guardians are power users who help grow CycleSense while maintaining our privacy-first mission.</p>
        <p class="muted">Guardian status is currently invite-only or granted to founding members.</p>
        <a href="/" class="btn btn-secondary">Return Home</a>
      </div>
    {:else}
      <section class="keys-section" in:fade>
        <div class="card usage-card">
          <div class="card-header">
            <h2>Your Gold Keys This Month</h2>
            <span class="reset-date">Resets {new Date(guardianData.keysResetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          
          <div class="usage-meter">
            <div class="meter-bar">
              <div class="meter-fill" style="width: {(guardianData.keysGeneratedThisMonth / guardianData.keysLimit) * 100}%"></div>
            </div>
            <div class="meter-labels">
              <span>{guardianData.keysGeneratedThisMonth} of {guardianData.keysLimit} used</span>
              <span>{guardianData.keysLimit - guardianData.keysGeneratedThisMonth} remaining</span>
            </div>
          </div>

          <button 
            onclick={generateKey} 
            class="btn btn-primary btn-generate" 
            disabled={generating || guardianData.keysGeneratedThisMonth >= guardianData.keysLimit}
          >
            {#if generating}
              Generating...
            {:else}
              Generate Gold Key
            {/if}
          </button>
        </div>

        {#if lastGeneratedKey}
          <div class="card success-card" transition:slide>
            <div class="success-icon">✨</div>
            <h3>Key Generated!</h3>
            <div class="code-display">{lastGeneratedKey.code}</div>
            <p>Share this link with a friend for 1 month of Pro.</p>
            <button onclick={() => shareKey(lastGeneratedKey.code)} class="btn btn-share">
              Share via...
            </button>
          </div>
        {/if}

        <div class="history-section">
          <h3><span class="icon">📜</span> Recent History</h3>
          {#if guardianData.history && guardianData.history.length > 0}
            <div class="history-list">
              {#each guardianData.history as item}
                <div class="history-item">
                  <div class="item-info">
                    <span class="item-code">{item.code}</span>
                    <span class="item-date">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div class="item-actions">
                    <span class="status-tag {item.status}">{item.status}</span>
                    {#if item.status === 'available'}
                      <button onclick={() => shareKey(item.code)} class="btn-icon-only" title="Share">
                        📤
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="empty-state">No keys generated yet.</p>
          {/if}
        </div>
      </section>

      <section class="benefits-section">
        <h3>Guardian Benefits</h3>
        <div class="benefits-grid">
          <div class="benefit-card">
            <img src="/assets/icons/guardian_badge.svg" alt="Guardian Badge" class="w-8 h-8" />
            <h4>Guardian Badge</h4>
            <p>Unique in-app badge showing your status.</p>
          </div>
          <div class="benefit-card">
            <span class="benefit-icon">🚀</span>
            <h4>Early Access</h4>
            <p>Be the first to test new Sense Engine improvements.</p>
          </div>
          <div class="benefit-card">
            <span class="benefit-icon">💎</span>
            <h4>Free Pro</h4>
            <p>Pro features are always unlocked for Guardians.</p>
          </div>
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #fdf2f8;
    color: #1f2937;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .header-gradient {
    background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
    color: white;
    padding: 2rem 0 4rem;
    text-align: center;
    position: relative;
  }

  .back-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 0.9rem;
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  .badge-hero h1 {
    font-size: 2rem;
    margin: 0.5rem 0;
  }

  .shield-container {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    width: 80px;
    height: 80px;
    line-height: 80px;
    border-radius: 50%;
    backdrop-filter: blur(4px);
  }

  .card {
    background: white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    margin-top: -3rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 10;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .card-header h2 {
    font-size: 1.1rem;
    margin: 0;
    color: #4b5563;
  }

  .reset-date {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  .usage-meter {
    margin-bottom: 1.5rem;
  }

  .meter-bar {
    height: 12px;
    background: #f3f4f6;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .meter-fill {
    height: 100%;
    background: #8B5CF6;
    border-radius: 6px;
    transition: width 0.3s ease;
  }

  .meter-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #6b7280;
  }

  .btn {
    display: block;
    width: 100%;
    padding: 0.8rem;
    border-radius: 9999px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #8B5CF6;
    color: white;
  }

  .btn-primary:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #4b5563;
  }

  .success-card {
    margin-top: 0;
    border: 2px solid #10b981;
    text-align: center;
  }

  .success-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .code-display {
    font-family: monospace;
    font-size: 1.5rem;
    background: #ecfdf5;
    color: #065f46;
    padding: 0.5rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    letter-spacing: 2px;
  }

  .btn-share {
    background: #ec4899;
    color: white;
  }

  .history-section h3 {
    font-size: 1rem;
    color: #4b5563;
    margin-bottom: 1rem;
  }

  .history-list {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .item-code {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .item-date {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  .status-tag {
    font-size: 0.7rem;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-weight: 700;
    margin-right: 0.5rem;
  }

  .status-tag.available { background: #ecfdf5; color: #059669; }
  .status-tag.claimed { background: #eff6ff; color: #2563eb; }

  .btn-icon-only {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .benefits-section {
    margin-top: 3rem;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .benefit-card {
    background: white;
    padding: 1rem;
    border-radius: 1rem;
    text-align: center;
  }

  .benefit-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .benefit-card h4 {
    font-size: 0.8rem;
    margin: 0 0 0.5rem 0;
  }

  .benefit-card p {
    font-size: 0.7rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.2;
  }

  .loading-state {
    text-align: center;
    padding: 4rem 0;
    color: #9ca3af;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #8B5CF6;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    color: #9ca3af;
    font-style: italic;
  }
</style>
