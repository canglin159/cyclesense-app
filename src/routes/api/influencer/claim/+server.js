
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import crypto from 'crypto';

export async function POST({ request }) {
  const { slug, userId } = await request.json();
  
  if (!slug || !userId) {
    return json({ success: false, error: 'Missing slug or userId' }, { status: 400 });
  }

  const tx = await db.transaction("write");
  try {
    // 1. Check if influencer exists and is active
    const influencerResult = await tx.execute({
      sql: 'SELECT slug FROM influencers WHERE slug = ? AND status = "active"',
      args: [slug]
    });

    if (influencerResult.rows.length === 0) {
      await tx.rollback();
      return json({ success: false, reason: 'invalid_influencer' }, { status: 404 });
    }

    // 2. Find an available gold key
    const keyResult = await tx.execute({
      sql: 'SELECT id, code FROM gold_keys WHERE influencer_slug = ? AND status = "available" LIMIT 1',
      args: [slug]
    });

    if (keyResult.rows.length === 0) {
      await tx.rollback();
      return json({ success: false, reason: 'exhausted' });
    }

    const key = keyResult.rows[0];
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 3. Update key status
    await tx.execute({
      sql: 'UPDATE gold_keys SET status = "claimed", claimed_by_user_id = ?, claimed_at = CURRENT_TIMESTAMP, expires_at = ? WHERE id = ?',
      args: [userId, expiresAt, key.id]
    });

    // 4. Increment influencer claimed count
    await tx.execute({
      sql: 'UPDATE influencers SET key_pool_claimed = key_pool_claimed + 1, referral_count = referral_count + 1 WHERE slug = ?',
      args: [slug]
    });

    // 5. Record attribution
    await tx.execute({
      sql: 'INSERT INTO referral_attribution (id, referred_user_id, source, source_detail, gold_key_code) VALUES (?, ?, "influencer", ?, ?)',
      args: [crypto.randomUUID(), userId, slug, key.code]
    });

    await tx.commit();
    
    return json({ 
      success: true, 
      code: key.code, 
      expiresAt 
    });
  } catch (err) {
    console.error('Gold Key Claim Error:', err);
    await tx.rollback();
    return json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
