import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import crypto from 'crypto';

const MAX_PAYLOAD_SIZE = 50 * 1024; // 50KB

export async function POST({ request }) {
    const body = await request.json();
    const { encrypted_payload, iv } = body;

    if (!encrypted_payload || !iv) {
        return json({ error: 'Missing payload or IV' }, { status: 400 });
    }

    if (encrypted_payload.length > MAX_PAYLOAD_SIZE) {
        return json({ error: 'Payload too large' }, { status: 413 });
    }

    const id = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    try {
        await db.execute({
            sql: 'INSERT INTO shares (id, encrypted_payload, iv, expires_at) VALUES (?, ?, ?, ?)',
            args: [id, encrypted_payload, iv, expires_at]
        });

        // Occasional cleanup of expired shares (1% chance)
        if (Math.random() < 0.01) {
            console.log('[API Share] Triggering background cleanup of expired shares...');
            db.execute({
                sql: 'DELETE FROM shares WHERE expires_at < CURRENT_TIMESTAMP',
                args: []
            }).catch(err => console.error('Cleanup error:', err));
        }

        return json({ id });
    } catch (err) {
        console.error('Error creating share:', err);
        return json({ error: 'Database error' }, { status: 500 });
    }
}

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    if (!id) {
        return json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT encrypted_payload, iv, expires_at FROM shares WHERE id = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return json({ error: 'Share not found' }, { status: 404 });
        }

        const share = result.rows[0];
        const expiresAt = new Date(share.expires_at);

        if (expiresAt < new Date()) {
            return json({ error: 'Share expired' }, { status: 410 });
        }

        return json({
            encrypted_payload: share.encrypted_payload,
            iv: share.iv
        });
    } catch (err) {
        console.error('Error fetching share:', err);
        return json({ error: 'Database error' }, { status: 500 });
    }
}
