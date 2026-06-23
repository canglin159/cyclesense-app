import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { REVENUECAT_API_KEY, STRIPE_SECRET_KEY } from '$env/static/private';

export async function GET() {
    try {
        // 1. Database Stats (Shares)
        const sharesResult = await db.execute('SELECT count(*) as count FROM shares');
        const totalShares = sharesResult.rows[0].count;

        // 2. Database Stats (Promo Keys)
        const promoResult = await db.execute('SELECT count(*) as total, count(used_by) as redeemed FROM promo_keys');
        const promoStats = {
            total: promoResult.rows[0].total,
            redeemed: promoResult.rows[0].redeemed
        };

        // breakdown by partner
        const partnerResult = await db.execute('SELECT assigned_to, count(*) as total, count(used_by) as redeemed FROM promo_keys GROUP BY assigned_to');
        const partnerBreakdown = partnerResult.rows.map(row => ({
            partner: row.assigned_to,
            total: row.total,
            redeemed: row.redeemed
        }));

        // 3. RevenueCat Stats (Placeholder until API is verified)
        // Note: Real-world would use RC GET /v1/subscribers or similar
        const rcStats = {
            activeSubscribers: 'N/A', // Requires specific RC API call or Webhook state in DB
            status: REVENUECAT_API_KEY.startsWith('test_') ? 'Sandbox' : 'Production'
        };

        // 4. Stripe Stats (Placeholder until get_finance_overview is resolved)
        const stripeStats = {
            balance: 'N/A', // get_finance_overview missing
            recentTransactions: 'N/A',
            status: STRIPE_SECRET_KEY === 'sk_test_placeholder' ? 'Mock/Placeholder' : 'Live'
        };

        return json({
            success: true,
            timestamp: new Date().toISOString(),
            growth: {
                totalShares,
                promoKeys: {
                    ...promoStats,
                    partnerBreakdown
                }
            },
            subscriptions: rcStats,
            finance: stripeStats
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
