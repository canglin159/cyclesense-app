import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST({ request }) {
    try {
        const payload = await request.json();
        const { event_type, metadata, client_hash } = payload;

        if (!event_type) {
            return json({ error: 'Missing event_type' }, { status: 400 });
        }

        // 1. Verify signature (Placeholder for HMAC verification)
        // In production, we'd check a signature in headers or payload

        // 2. INSERT into analytics_events
        const eventId = crypto.randomUUID();
        await db.execute({
            sql: `INSERT INTO analytics_events (id, event_type, event_metadata, client_hash)
                  VALUES (?, ?, ?, ?)`,
            args: [eventId, event_type, JSON.stringify(metadata || {}), client_hash || null]
        });

        // 3. UPSERT into daily_rollups
        const metricMap = {
            'page_view': 'page_views',
            'gold_key_claim': 'gold_key_claims',
            'onboarding_complete': 'onboardings',
            'premium_conversion': 'premium_conversions',
            'cycle_logged': 'cycles_logged',
            'prediction_viewed': 'prediction_views',
            'ad_impression': 'ad_impressions'
        };

        const metricName = metricMap[event_type];
        if (metricName) {
            // Apply differential privacy noise (±1)
            // Increments: 0 (1/3 chance), 1 (1/3 chance), 2 (1/3 chance)
            // Average increment = (0+1+2)/3 = 1
            const increment = Math.floor(Math.random() * 3);

            await db.execute({
                sql: `INSERT INTO daily_rollups (date, metric_name, metric_value)
                      VALUES (date('now'), ?, ?)
                      ON CONFLICT(date, metric_name) DO UPDATE SET metric_value = metric_value + ?`,
                args: [metricName, increment, increment]
            });
        }

        return new Response(null, { status: 204 });
    } catch (err) {
        console.error('Analytics API error:', err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
