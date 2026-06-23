
export const prerender = false;

import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
  const { influencer: slug } = params;
  
  try {
    const result = await db.execute({
      sql: 'SELECT name, slug, bio, photo_url, key_pool_total, key_pool_claimed FROM influencers WHERE slug = ? AND status = "active"',
      args: [slug]
    });
    
    if (result.rows.length === 0) {
      throw redirect(307, '/');
    }
    
    const influencer = result.rows[0];
    
    return {
      influencer,
      keysRemaining: influencer.key_pool_total - influencer.key_pool_claimed
    };
  } catch (err) {
    if (err.status === 307) throw err;
    console.error('Error loading influencer:', err);
    throw redirect(307, '/');
  }
}
