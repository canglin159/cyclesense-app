import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST({ request }) {
  const { userId, subscriptionId } = await request.json();
  
  if (!userId) {
    return json({ success: false, error: 'Missing userId' }, { status: 400 });
  }

  try {
    await db.execute({
      sql: `UPDATE referral_attribution 
       SET converted_to_premium = 1, 
           converted_at = CURRENT_TIMESTAMP,
           stripe_subscription_id = ?
       WHERE referred_user_id = ?`,
      args: [subscriptionId, userId]
    });
    
    // Also update gold_keys if applicable
    await db.execute({
      sql: `UPDATE gold_keys 
       SET converted_to_premium_at = CURRENT_TIMESTAMP
       WHERE claimed_by_user_id = ? AND status = 'claimed'`,
      args: [userId]
    });
    
    return json({ success: true });
  } catch (err) {
    console.error('Attribution conversion error:', err);
    return json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
