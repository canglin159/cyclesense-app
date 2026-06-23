
const { execSync } = require('child_process');
const crypto = require('crypto');

const influencers = [
  { name: 'Hormone Health Hub', slug: 'hormone-health-hub', original: '@hormone_health_hub' },
  { name: 'DeGoogled Life', slug: 'degoogled-life', original: '@degoogled_life' },
  { name: 'Slow Tech Mama', slug: 'slow-tech-mama', original: '@slow_tech_mama' },
  { name: 'Tech Detox Diva', slug: 'tech-detox-diva', original: '@tech_detox_diva' },
  { name: 'Privacy is Power', slug: 'privacy-is-power', original: '@privacy_is_power' },
  { name: 'PWA Rockstar', slug: 'pwa-rockstar', original: '@pwa_rockstar' },
  { name: 'Eco Wellness Gal', slug: 'eco-wellness-gal', original: '@eco_wellness_gal' },
  { name: 'Data Dignity', slug: 'data-dignity', original: '@data_dignity' },
  { name: 'Privacy Pro', slug: 'privacy-pro', original: '@privacy_pro' },
  { name: 'Secure Minimalist', slug: 'secure-minimalist', original: '@secure_minimalist' },
  { name: 'Data Autonomy', slug: 'data-autonomy', original: '@data_autonomy' },
  { name: 'Essential Living', slug: 'essential-living', original: '@essential_living' },
];

function runSql(sql) {
  console.log('Running:', sql);
  const result = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`).toString();
  return JSON.parse(result);
}

// 1. Insert Influencers
for (const inf of influencers) {
  const id = crypto.randomUUID();
  runSql(`INSERT OR IGNORE INTO influencers (id, name, slug, status) VALUES ('${id}', '${inf.name}', '${inf.slug}', 'active')`);
}

// 2. Migrate Keys
const promoKeys = runSql("SELECT * FROM promo_keys WHERE assigned_to IS NOT NULL");
for (const pk of promoKeys) {
  const id = crypto.randomUUID();
  const inf = influencers.find(i => i.original === pk.assigned_to);
  if (!inf) continue;
  
  const status = pk.used_by ? 'claimed' : 'available';
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days if not set
  
  runSql(`INSERT OR IGNORE INTO gold_keys (id, code, influencer_slug, source_type, status, claimed_by_user_id, claimed_at, expires_at) 
          VALUES ('${id}', '${pk.key}', '${inf.slug}', 'influencer', '${status}', ${pk.used_by ? `'${pk.used_by}'` : 'NULL'}, ${pk.used_at ? `'${pk.used_at}'` : 'NULL'}, '${expires_at}')`);
}

// 3. Update key_pool_total and key_pool_claimed
for (const inf of influencers) {
    const counts = runSql(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed FROM gold_keys WHERE influencer_slug = '${inf.slug}'`);
    const total = counts[0].total;
    const claimed = counts[0].claimed || 0;
    runSql(`UPDATE influencers SET key_pool_total = ${total}, key_pool_claimed = ${claimed} WHERE slug = '${inf.slug}'`);
}

console.log('Seeding complete.');
