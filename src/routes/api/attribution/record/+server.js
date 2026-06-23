import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import crypto from 'crypto';

export async function POST({ request }) {
  const { userId, source, sourceDetail, goldKeyCode } = await request.json();
  
  if (!userId || !source) {
    return json({ success: false, error: 'Missing userId or source' }, { status: 400 });
  }

  try {
      await db.execute({
        sql: `INSERT INTO referral_attribution 
         (id, referred_user_id, source, source_detail, gold_key_code, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(referred_user_id) DO NOTHING`,
        args: [crypto.randomUUID(), userId, source, sourceDetail, goldKeyCode]
      });
      
      return json({ success: true });
  } catch (err) {
      console.error('Attribution record error:', err);
      return json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
