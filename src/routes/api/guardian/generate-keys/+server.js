import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import crypto from 'crypto';

function generateKeyCode(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${prefix}-${code}`;
}

export async function GET({ url }) {
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return json({ success: false, error: 'Missing userId' }, { status: 400 });
  }

  try {
    let guardianResult = await db.execute({
      sql: 'SELECT * FROM guardians WHERE user_id = ?',
      args: [userId]
    });

    if (guardianResult.rows.length === 0) {
      return json({ 
        success: true, 
        isGuardian: false,
        keysGeneratedThisMonth: 0,
        keysLimit: 5
      });
    }

    let guardian = guardianResult.rows[0];
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastReset = new Date(guardian.keys_reset_date);
    const lastResetMonth = lastReset.toISOString().slice(0, 7);

    if (currentMonth !== lastResetMonth) {
      // Monthly reset if checked via GET
      await db.execute({
        sql: 'UPDATE guardians SET keys_generated_this_month = 0, keys_reset_date = ? WHERE user_id = ?',
        args: [now.toISOString(), userId]
      });
      guardian.keys_generated_this_month = 0;
      guardian.keys_reset_date = now.toISOString();
    }

    // Get keys generated this month
    const keysResult = await db.execute({
        sql: 'SELECT code, status, created_at FROM gold_keys WHERE source_user_id = ? AND source_type = "guardian" ORDER BY created_at DESC LIMIT 10',
        args: [userId]
    });

    return json({
      success: true,
      isGuardian: !!guardian.is_guardian,
      keysGeneratedThisMonth: guardian.keys_generated_this_month,
      keysLimit: guardian.keys_limit,
      keysResetDate: guardian.keys_reset_date,
      history: keysResult.rows
    });
  } catch (err) {
    console.error('Guardian Status Error:', err);
    return json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST({ request }) {
  const { userId } = await request.json();

  if (!userId) {
    return json({ success: false, error: 'Missing userId' }, { status: 400 });
  }

  const tx = await db.transaction("write");
  try {
    let guardianResult = await tx.execute({
      sql: 'SELECT * FROM guardians WHERE user_id = ?',
      args: [userId]
    });

    let guardian;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    if (guardianResult.rows.length === 0) {
      // Create guardian record if it doesn't exist (assuming client-side isGuardian verification)
      guardian = {
        user_id: userId,
        is_guardian: 1,
        guardian_since: now.toISOString(),
        keys_generated_this_month: 0,
        keys_limit: 5,
        keys_reset_date: now.toISOString()
      };
      await tx.execute({
        sql: 'INSERT INTO guardians (user_id, is_guardian, guardian_since, keys_generated_this_month, keys_limit, keys_reset_date) VALUES (?, ?, ?, ?, ?, ?)',
        args: [guardian.user_id, guardian.is_guardian, guardian.guardian_since, guardian.keys_generated_this_month, guardian.keys_limit, guardian.guardian_since]
      });
    } else {
      guardian = guardianResult.rows[0];
      const lastReset = new Date(guardian.keys_reset_date);
      const lastResetMonth = lastReset.toISOString().slice(0, 7);
      
      if (currentMonth !== lastResetMonth) {
        guardian.keys_generated_this_month = 0;
        guardian.keys_reset_date = now.toISOString();
        await tx.execute({
          sql: 'UPDATE guardians SET keys_generated_this_month = 0, keys_reset_date = ? WHERE user_id = ?',
          args: [guardian.keys_reset_date, userId]
        });
      }
    }

    if (!guardian.is_guardian) {
      await tx.rollback();
      return json({ success: false, reason: 'not_guardian' }, { status: 403 });
    }

    if (guardian.keys_generated_this_month >= guardian.keys_limit) {
      await tx.rollback();
      return json({ success: false, reason: 'limit_reached' });
    }

    const code = generateKeyCode('GUARD');
    const keyId = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await tx.execute({
      sql: 'INSERT INTO gold_keys (id, code, source_type, source_user_id, status, expires_at) VALUES (?, ?, "guardian", ?, "available", ?)',
      args: [keyId, code, userId, expiresAt]
    });

    await tx.execute({
      sql: 'UPDATE guardians SET keys_generated_this_month = keys_generated_this_month + 1, last_active_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      args: [userId]
    });

    await tx.commit();

    return json({ 
      success: true, 
      code, 
      shareLink: `cyclesense.app/gift/${code}`,
      keysGeneratedThisMonth: guardian.keys_generated_this_month + 1,
      keysLimit: guardian.keys_limit
    });

  } catch (err) {
    console.error('Guardian Key Generation Error:', err);
    await tx.rollback();
    return json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
