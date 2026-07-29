# Google Play Submission Guide — 24-Hour Target

## Goal: Get CycleSense to production on Google Play

You have 2 paths. **Path A** (exemption) is the fast route. **Path B** (closed testing) is the fallback.

---

## Path A: Request Managed Publishing Exemption (Fast — 1-3 days)

### Step 1: Enable the Google Play Android Developer API
1. Go to: https://console.developers.google.com/apis/api/androidpublisher.googleapis.com/overview?project=257316566214
2. Click **"Enable"**
3. Wait 5 minutes

### Step 2: Upload the AAB to Internal Testing
```bash
node /home/team/shared/scripts/upload-to-play-store.js --track internal
```
Or upload manually via Play Console → Release → Internal testing → Create new release.

### Step 3: Submit the Exemption Request
1. Go to: **Play Console** → **Testing** → **Managed publishing**
2. Click **"Request exemption"**
3. Fill in the form with **this exact text**:

---

**Exemption Request Title:** Managed Publishing Exemption — CycleSense (io.cyclesense.app)

**Exemption Request Body (copy-paste this):**

CycleSense is a paid-only ($19.99/yr) period and ovulation tracker — a digital health app that stores sensitive reproductive health data. It qualifies for an exemption because:

1. **Health & Medical app** — Period tracker under Google's health category, storing sensitive reproductive health data
2. **Paid-only with no data collection** — No free tier, no ads, no analytics. All data stays on-device (IndexedDB). No servers, no accounts, no data brokers
3. **Internal testing complete** — AAB v1.1.0 (28 MB) with RevenueCat Google Play Billing is ready on the internal testing track
4. **14-day delay harms business** — Paid app with zero revenue; every day delays recouping the $25 Play Store fee
5. **Privacy-first architecture** — Zero-knowledge design means no data can be subpoenaed. The app cannot be used for data harvesting

The app is already live as a PWA at https://cyclesense.app with a Stripe paywall — demonstrating production readiness. Privacy policy is hosted. All code is committed.

We request an exemption from the 14-day closed testing requirement so CycleSense can be published to production immediately.

---

### Step 4: Wait
Google typically responds in **1-3 business days**. Check your email (ca6292@gmail.com) and Play Console notifications.

### Step 5: If Approved → Promote to Production
1. Go to **Release → Internal testing**
2. Click **"Promote to production"** next to the v1.1.0 release
3. Complete the store listing (description, screenshots, category)
4. Submit for review

---

## Path B: 14-Day Closed Testing (Fallback — 14+ days)

If the exemption is denied:

### Step 1: Recruit 20+ Testers
1. Go to **Play Console → Testing → Internal testing**
2. Copy the **"Opt-in link"** (looks like `https://play.google.com/apps/testing/io.cyclesense.app`)
3. Share it with at least 20 people. Use the promo codes:
   - **CS-GOLD-121** through **CS-GOLD-180** (60 codes allocated for testers)
   - Tell testers: "Install the app, open it, and enter your promo code to get free premium access"

### Step 2: Wait 14 Days
The 14-day clock starts when the first tester opts in. All 20 testers must stay opted in for 14 consecutive days.

### Step 3: Promote to Production
1. After 14 days, the **"Promote to production"** button becomes active
2. Click it and complete the store listing

---

## Quick Reference

| Item | Details |
|------|---------|
| Package name | `io.cyclesense.app` |
| AAB v1.1.0 | `/home/team/shared/production-artifacts/cyclesense-v1.1.0.aab` (28 MB) |
| Upload script | `node /home/team/shared/scripts/upload-to-play-store.js` |
| Enable API | https://console.developers.google.com/apis/api/androidpublisher.googleapis.com/overview?project=257316566214 |
| Play Console | https://play.google.com/console |
| PWA | https://cyclesense.app |
| Promo codes | CS-GOLD-121 to 180 (for testers) |
| Exemption response | 1-3 business days |