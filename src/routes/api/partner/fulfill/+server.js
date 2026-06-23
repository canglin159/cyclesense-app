import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { REVENUECAT_API_KEY } from '$env/static/private';

export async function POST({ request }) {
    const { userId, type, key } = await request.json();

    if (!userId || type !== 'lifetime' || !key) {
        return json({ error: 'Invalid request: userId, type, and key are required' }, { status: 400 });
    }

    try {
        // 1. Verify the key against the database
        const keyResult = await db.execute({
            sql: 'SELECT used_by, used_at, assigned_to FROM promo_keys WHERE key = ?',
            args: [key]
        });

        if (keyResult.rows.length === 0) {
            console.error(`[Partner Fulfillment] Invalid key attempt: ${key}`);
            return json({ error: 'Invalid partner key' }, { status: 403 });
        }

        const promoKey = keyResult.rows[0];
        if (promoKey.used_by) {
            console.error(`[Partner Fulfillment] Key already used: ${key} by ${promoKey.used_by}`);
            return json({ error: 'Partner key already redeemed' }, { status: 409 });
        }

        console.log(`[Partner Fulfillment] Key verified for ${promoKey.assigned_to}. Granting lifetime access to ${userId}`);

        // 2. Grant Lifetime to the user via RevenueCat
        // Note: REVENUECAT_API_KEY must be a v1 Secret Key for this to work.
        const rcResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}/entitlements/Cyclesense Pro/promotional`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                duration: 'lifetime'
            })
        });

        if (rcResponse.ok) {
            // 3. Mark the key as used in our database
            await db.execute({
                sql: 'UPDATE promo_keys SET used_by = ?, used_at = CURRENT_TIMESTAMP WHERE key = ?',
                args: [userId, key]
            });

            return json({ 
                success: true, 
                message: 'Gold Key access granted successfully',
                partner: promoKey.assigned_to
            });
        } else {
            const errorText = await rcResponse.text();
            console.error('RevenueCat promotional grant error:', errorText);
            
            // If it's an invalid API key, we should let the admin know
            if (rcResponse.status === 401 || rcResponse.status === 403) {
                 return json({ error: 'Server configuration error: Invalid RevenueCat Secret Key' }, { status: 500 });
            }
            
            return json({ error: 'Failed to grant entitlement in RevenueCat' }, { status: 502 });
        }
    } catch (err) {
        console.error('Fulfillment error:', err);
        return json({ error: 'Internal server error during fulfillment' }, { status: 500 });
    }
}
