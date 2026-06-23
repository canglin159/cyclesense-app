<script>
  let { data } = $props();
  let { influencer, funnel, timeline } = data;

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Calculate some helper metrics
  let visitToClaimRate = $derived(funnel.total_referrals > 0 
    ? ((influencer.key_pool_claimed / funnel.total_referrals) * 100).toFixed(1)
    : 0);
</script>

<div class="dashboard">
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div>
          <span class="badge">Influencer Partner</span>
          <h1>{influencer.name}</h1>
          <p class="slug">cyclesense.app/{influencer.slug}</p>
        </div>
        <div class="date-range">
          Last 30 Days
        </div>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="grid">
      <!-- Key Usage Card -->
      <div class="card">
        <h3>Key Usage</h3>
        <div class="big-number">
          {influencer.key_pool_claimed} <small>/ {influencer.key_pool_total}</small>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width: {(influencer.key_pool_claimed / (influencer.key_pool_total || 1)) * 100}%"></div>
        </div>
        <p class="label">{((influencer.key_pool_claimed / (influencer.key_pool_total || 1)) * 100).toFixed(0)}% of your Gold Keys claimed</p>
      </div>

      <!-- Conversion Rate Card -->
      <div class="card">
        <h3>Claim to Pro Rate</h3>
        <div class="big-number">
          {funnel.key_to_premium_pct}%
        </div>
        <p class="label">Percentage of claims that converted to a paid subscription.</p>
      </div>

      <!-- Premium Subscribers Card -->
      <div class="card">
        <h3>Premium Conversions</h3>
        <div class="big-number">
          {funnel.premium_conversions}
        </div>
        <p class="label">Total Pro members referred from your community.</p>
      </div>
    </div>

    <!-- Funnel Visualization -->
    <section class="section">
      <h2>Conversion Funnel</h2>
      <div class="funnel">
        <div class="funnel-step">
          <div class="step-label">Visits</div>
          <div class="step-value">{funnel.total_referrals}</div>
          <div class="step-bar" style="width: 100%"></div>
        </div>
        <div class="funnel-step">
          <div class="step-label">Gold Key Claims</div>
          <div class="step-value">{influencer.key_pool_claimed}</div>
          <div class="step-bar" style="width: {(influencer.key_pool_claimed / (funnel.total_referrals || 1)) * 100}%"></div>
          <div class="step-dropoff">{visitToClaimRate}% conversion from visit</div>
        </div>
        <div class="funnel-step">
          <div class="step-label">Premium Conversions</div>
          <div class="step-value">{funnel.premium_conversions}</div>
          <div class="step-bar" style="width: {(funnel.premium_conversions / (funnel.total_referrals || 1)) * 100}%"></div>
          <div class="step-dropoff">{funnel.conversion_rate_pct}% conversion from visit</div>
        </div>
      </div>
    </section>

    <!-- Timeline Chart Placeholder (using simple bars) -->
    <section class="section">
      <h2>Referral Activity (Last 30 Days)</h2>
      {#if timeline.length > 0}
        <div class="timeline">
          {#each timeline as entry}
            <div class="timeline-bar-container">
              <div class="timeline-bar" style="height: {Math.min(entry.count * 10, 150)}px">
                <span class="tooltip">{entry.count} claims</span>
              </div>
              <div class="timeline-date">{formatDate(entry.date)}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          No activity recorded in the last 30 days.
        </div>
      {/if}
    </section>
  </main>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
    color: #111827;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .header {
    background: white;
    padding: 2rem 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 2rem;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  h1 { margin: 0; font-size: 1.875rem; }
  .slug { color: #6b7280; margin: 0.25rem 0 0 0; }
  .badge {
    background: #f3f4f6;
    color: #4b5563;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .date-range {
    background: #eff6ff;
    color: #1d4ed8;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }
  .card h3 {
    margin-top: 0;
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .big-number {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0.5rem 0;
  }
  .big-number small {
    font-size: 1rem;
    color: #9ca3af;
    font-weight: 400;
  }
  .label {
    margin: 0.5rem 0 0 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
  .progress-bar {
    background: #f3f4f6;
    height: 0.5rem;
    border-radius: 9999px;
    margin: 1rem 0 0.5rem 0;
  }
  .progress {
    background: #8b5cf6;
    height: 100%;
    border-radius: 9999px;
  }
  .section {
    margin-bottom: 3rem;
  }
  .section h2 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
  .funnel {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }
  .funnel-step {
    margin-bottom: 2rem;
  }
  .funnel-step:last-child { margin-bottom: 0; }
  .step-label { font-weight: 500; margin-bottom: 0.5rem; }
  .step-value { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
  .step-bar {
    height: 2.5rem;
    background: linear-gradient(90deg, #8b5cf6, #d946ef);
    border-radius: 0.5rem;
    opacity: 0.8;
  }
  .step-dropoff {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }
  .timeline {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    height: 250px;
    overflow-x: auto;
  }
  .timeline-bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
  }
  .timeline-bar {
    width: 30px;
    background: #8b5cf6;
    border-radius: 0.25rem 0.25rem 0 0;
    position: relative;
    transition: background 0.2s;
  }
  .timeline-bar:hover {
    background: #7c3aed;
  }
  .timeline-date {
    font-size: 0.7rem;
    color: #9ca3af;
    margin-top: 1rem;
    transform: rotate(-45deg);
    white-space: nowrap;
    margin-bottom: 1rem;
  }
  .tooltip {
    visibility: hidden;
    background-color: #1f2937;
    color: #fff;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    position: absolute;
    z-index: 10;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .timeline-bar:hover .tooltip {
    visibility: visible;
  }
  .empty-state {
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    text-align: center;
    color: #6b7280;
    border: 1px dashed #d1d5db;
  }
</style>
