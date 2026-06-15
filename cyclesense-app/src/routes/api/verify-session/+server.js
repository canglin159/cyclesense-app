import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, REVENUECAT_API_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
    const { sessionId } = await request.json();

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.client_reference_id;
            
            // Sync with RevenueCat
            // Note: In production, the Stripe App for RevenueCat handles this automatically
            // But we can also manually trigger a receipt validation or identification
            
            // For now, we return success and let the client re-sync with RevenueCat
            return json({ 
                success: true, 
                userId: userId,
                customerId: session.customer 
            });
        } else {
            return json({ success: false, status: session.payment_status });
        }
    } catch (err) {
        console.error('Error verifying session:', err);
        return json({ error: err.message }, { status: 500 });
    }
}
