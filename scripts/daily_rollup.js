import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function runRollup() {
    console.log('Running daily rollup...');
    
    try {
        // This is a more comprehensive rollup that would normally be run by a cron job
        // It processes the last 24 hours of events and ensures daily_rollups is up to date
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        // 1. Roll up events from raw table
        const metrics = [
            { type: 'page_view', name: 'page_views' },
            { type: 'gold_key_claim', name: 'gold_key_claims' },
            { type: 'onboarding_complete', name: 'onboardings' },
            { type: 'premium_conversion', name: 'premium_conversions' },
            { type: 'cycle_logged', name: 'cycles_logged' },
            { type: 'prediction_viewed', name: 'prediction_views' },
            { type: 'ad_impression', name: 'ad_impressions' }
        ];

        for (const metric of metrics) {
            const result = await db.execute({
                sql: `SELECT COUNT(*) as count FROM analytics_events 
                      WHERE event_type = ? AND date(created_at) = ?`,
                args: [metric.type, dateStr]
            });

            const count = result.rows[0].count;
            
            // Apply differential privacy noise if not already done by API
            // Actually, the API already updates daily_rollups, so this script
            // can serve as a "correction" or "reconciliation" step, 
            // OR it can handle metrics that are harder to track in real-time.
            
            console.log(`Metric ${metric.name} for ${dateStr}: ${count}`);
            
            await db.execute({
                sql: `INSERT INTO daily_rollups (date, metric_name, metric_value)
                      VALUES (?, ?, ?)
                      ON CONFLICT(date, metric_name) DO UPDATE SET metric_value = ?`,
                args: [dateStr, metric.name, count, count]
            });
        }

        // 2. Clean up raw events older than 30 days
        console.log('Cleaning up old events...');
        await db.execute(`
            DELETE FROM analytics_events 
            WHERE created_at < datetime('now', '-30 days')
        `);

        console.log('Rollup complete.');
    } catch (err) {
        console.error('Rollup failed:', err);
    }
}

runRollup();
