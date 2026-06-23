import crypto from 'crypto';
import { DASHBOARD_SECRET } from '$env/static/private';

/**
 * Generates a zero-auth HMAC token for a dashboard slug.
 * @param {string} slug 
 * @returns {string}
 */
export function generateDashboardToken(slug) {
  if (!DASHBOARD_SECRET) {
      console.warn('DASHBOARD_SECRET is not set. Dashboard tokens will be insecure.');
  }
  const hmac = crypto.createHmac('sha256', DASHBOARD_SECRET || 'dev_secret');
  hmac.update(slug);
  return hmac.digest('hex').slice(0, 16);
}

/**
 * Verifies a dashboard token for a slug.
 * @param {string} slug 
 * @param {string} token 
 * @returns {boolean}
 */
export function verifyDashboardToken(slug, token) {
  return token === generateDashboardToken(slug);
}
