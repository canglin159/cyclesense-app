import { execSync } from 'child_process';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const DASHBOARD_SECRET = process.env.DASHBOARD_SECRET || 'dev_secret';

function generateDashboardToken(slug) {
  const hmac = crypto.createHmac('sha256', DASHBOARD_SECRET);
  hmac.update(slug);
  return hmac.digest('hex').slice(0, 16);
}

function run() {
    try {
        const output = execSync('team-db "SELECT name, slug FROM influencers"').toString();
        const influencers = JSON.parse(output);
        
        console.log('--- Influencer Dashboard Links ---');
        for (const influencer of influencers) {
            const token = generateDashboardToken(influencer.slug);
            const url = `https://cyclesense.app/dashboard/influencer/${influencer.slug}?token=${token}`;
            console.log(`${influencer.name} (${influencer.slug}): ${url}`);
        }
    } catch (err) {
        console.error('Error generating links:', err.message);
    }
}

run();
