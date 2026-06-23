import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const TURSO_DATABASE_URL = "libsql://agent-team-bc373712-cto.aws-us-west-2.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA0MzkwNjcsImlkIjoiMDE5ZThhNzAtMjgwMS03ZTI2LWFlZmUtODY2YjI4YTRkYWU0IiwicmlkIjoiY2NlMzdiMzQtMjgzYS00NmU5LWI2ZWUtZDBjYTk5Y2Y4MzkxIn0.kX3KsaafX2B7HTUF2dMPxFpK9YXPVGODsJvIBI8RxQcHnKyvO2T7kTeBjsb5r4egUPw13xkLF9DU5JBbjYUDBQ";

const db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function populate() {
    const content = fs.readFileSync('/home/team/shared/gold_keys_allocation.md', 'utf8');
    const lines = content.split('\n');
    const keys = [];
    
    for (const line of lines) {
        const match = line.match(/\| (CS-GOLD-\d+) \| Active \| ([^|]+) \|/);
        if (match) {
            keys.push({
                key: match[1],
                assigned_to: match[2].trim()
            });
        }
    }
    
    console.log(`Found ${keys.length} keys.`);
    
    for (const k of keys) {
        try {
            await db.execute({
                sql: 'INSERT OR IGNORE INTO promo_keys (key, type, assigned_to) VALUES (?, ?, ?)',
                args: [k.key, 'lifetime', k.assigned_to]
            });
        } catch (e) {
            console.error(`Failed to insert ${k.key}`, e);
        }
    }
    
    console.log('Done.');
}

populate();
