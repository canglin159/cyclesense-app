import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object);
            break;
        case 'invoice.paid':
            // Extend access (existing logic would go here)
            break;
        case 'customer.subscription.deleted':
            // Revoke access (existing logic would go here)
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return json({ received: true });
}

async function handleCheckoutCompleted(session) {
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;
    
    if (!userId) {
        console.warn('Checkout completed session missing client_reference_id');
        return;
    }

    try {
        // 1. Mark attribution as converted
        await db.execute({
            sql: `UPDATE referral_attribution 
            SET converted_to_premium = 1, 
                converted_at = CURRENT_TIMESTAMP,
                stripe_subscription_id = ?
            WHERE referred_user_id = ?`,
            args: [subscriptionId, userId]
        });
        
        // 2. Update gold_keys if applicable
        await db.execute({
            sql: `UPDATE gold_keys 
            SET converted_to_premium_at = CURRENT_TIMESTAMP
            WHERE claimed_by_user_id = ? AND status = 'claimed'`,
            args: [userId]
        });

        console.log(`Conversion recorded for user ${userId}`);
    } catch (err) {
        console.error('Error recording conversion in webhook:', err);
    }
}
