import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { REVENUECAT_API_KEY } from '$env/static/private';

export async function GET() {
    let dbStatus = 'ok';
    let rcStatus = 'ok';
    let details = {};

    try {
        await db.execute('SELECT 1');
    } catch (e) {
        dbStatus = 'error';
        details.dbError = e.message;
    }

    try {
        const rcRes = await fetch('https://api.revenuecat.com/v1/subscribers/health_check', {
            headers: { 'Authorization': `Bearer ${REVENUECAT_API_KEY}` }
        });
        if (rcRes.status >= 500) {
            rcStatus = 'error';
            details.rcStatus = rcRes.status;
        }
    } catch (e) {
        rcStatus = 'error';
        details.rcError = e.message;
    }

    return json({
        status: dbStatus === 'ok' && rcStatus === 'ok' ? 'healthy' : 'unhealthy',
        db: dbStatus,
        rc: rcStatus,
        ...details,
        timestamp: new Date().toISOString()
    });
}
