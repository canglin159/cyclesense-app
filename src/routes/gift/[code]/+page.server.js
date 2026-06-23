export const prerender = false;

import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
  const { code } = params;

  try {
    const result = await db.execute({
      sql: 'SELECT g.*, i.name as influencer_name FROM gold_keys g LEFT JOIN influencers i ON g.influencer_slug = i.slug WHERE g.code = ?',
      args: [code]
    });

    if (result.rows.length === 0) {
      throw error(404, 'Gift code not found');
    }

    const key = result.rows[0];

    if (key.status !== 'available') {
        return {
            key: { ...key, status: key.status },
            alreadyClaimed: true
        };
    }

    // If it's a guardian key, we might want to get the guardian's name if we had one,
    // but the spec says "Local user ID" and we prioritize privacy.
    // So we'll just say "A Community Guardian".

    return {
      key: {
          code: key.code,
          source_type: key.source_type,
          influencer_name: key.influencer_name,
          expires_at: key.expires_at
      }
    };
  } catch (err) {
    if (err.status) throw err;
    console.error('Error loading gift:', err);
    throw error(500, 'Internal Server Error');
  }
}
