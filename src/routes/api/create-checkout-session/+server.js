import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
    const { priceId, userId, email, successUrl, cancelUrl } = await request.json();

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'], // Add more if needed
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: userId,
            customer_email: email,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: userId
            }
        });

        return json({ url: session.url });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        return json({ error: err.message }, { status: 500 });
    }
}
