import { json } from '@sveltejs/kit';
import { REVENUECAT_API_KEY } from '$env/static/private';

export async function POST({ request }) {
    const { userId, referredBy } = await request.json();

    if (!userId || !referredBy) {
        return json({ error: 'Missing userId or referredBy' }, { status: 400 });
    }

    if (userId === referredBy) {
        return json({ error: 'Self-referral is not allowed' }, { status: 400 });
    }

    try {
        // 1. Verify referrer exists in RevenueCat
        const refCheck = await fetch(`https://api.revenuecat.com/v1/subscribers/${referredBy}`, {
            headers: { 'Authorization': `Bearer ${REVENUECAT_API_KEY}` }
        });
        
        // If referrer doesn't exist, they might be new. 
        // We'll proceed if the status is 200 or 404 (RC creates on first interaction)
        // but some RC API versions/configs might return 404 for truly empty users.
        // For robustness, we'll allow it if it's not a server error.
        if (!refCheck.ok && refCheck.status !== 404) {
            console.warn(`Referrer ${referredBy} check failed with status ${refCheck.status}`);
            return json({ error: 'Invalid referral code' }, { status: 400 });
        }

        // 2. Grant 1 month to the new user (userId)
        const res1 = await grantPro(userId);
        
        // 3. Grant 1 month to the referrer (referredBy)
        const res2 = await grantPro(referredBy);

        if (res1.ok && res2.ok) {
            console.log(`[Referral] Success: ${userId} referred by ${referredBy}`);
            return json({ success: true });
        } else {
            const err1 = await res1.text();
            const err2 = await res2.text();
            console.error('RevenueCat grant error:', err1, err2);
            return json({ error: 'Failed to grant reward' }, { status: 500 });
        }
    } catch (err) {
        console.error('Referral activation error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}

async function grantPro(appUserId) {
    // RevenueCat REST API to grant promotional entitlement
    // Entitlement ID is "Cyclesense Pro" or "premium" based on premiumStore.svelte.js
    // We'll try "Cyclesense Pro" as primary.
    const entitlementId = 'Cyclesense Pro';
    const url = `https://api.revenuecat.com/v1/subscribers/${appUserId}/entitlements/${entitlementId}/promotional`;
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            duration: 'P1M' // 1 Month
        })
    });
}
