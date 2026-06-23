export const prerender = false;

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { verifyDashboardToken } from '$lib/server/auth';

export async function load({ params, url }) {
  const { slug } = params;
  const token = url.searchParams.get('token');

  // Verify token
  if (!verifyDashboardToken(slug, token)) {
    throw error(403, 'Invalid or missing dashboard token');
  }

  // Load influencer data
  const influencerResult = await db.execute({
    sql: `SELECT name, slug, key_pool_total, key_pool_claimed, created_at 
          FROM influencers WHERE slug = ?`,
    args: [slug]
  });

  if (influencerResult.rows.length === 0) {
    throw error(404, 'Influencer not found');
  }

  const influencer = influencerResult.rows[0];

  // Load funnel data from view
  const funnelResult = await db.execute({
    sql: `SELECT total_referrals, premium_conversions, conversion_rate_pct, key_to_premium_pct 
          FROM v_influencer_conversion WHERE slug = ?`,
    args: [slug]
  });

  const funnel = funnelResult.rows[0] || {
    total_referrals: 0,
    premium_conversions: 0,
    conversion_rate_pct: 0,
    key_to_premium_pct: 0
  };

  // Load timeline data (claims per day for last 30 days)
  const timelineResult = await db.execute({
    sql: `SELECT date(created_at) as date, COUNT(*) as count 
          FROM referral_attribution 
          WHERE source_detail = ? AND source = 'influencer'
          AND created_at > date('now', '-30 days')
          GROUP BY date(created_at)
          ORDER BY date(created_at) ASC`,
    args: [slug]
  });

  return {
    influencer,
    funnel,
    timeline: timelineResult.rows
  };
}
