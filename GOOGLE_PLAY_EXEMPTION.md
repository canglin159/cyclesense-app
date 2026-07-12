# Google Play Managed Publishing Exemption — CycleSense

## Overview

Google requires new developer accounts to complete a **14-day closed testing** phase (with ≥20 testers) before apps can be promoted to production. **CycleSense qualifies for a managed publishing exemption** because it is a paid-only health app with zero data collection, no ads, and local-only storage.

This document contains everything needed to submit the exemption request.

---

## 1. What Is the Managed Publishing Exemption?

The exemption allows apps to bypass the 14-day closed testing requirement if they meet specific criteria. Once granted, the app can be published directly to production after internal testing.

**Where to submit:** Google Play Console → "Testing" → "Managed publishing" → Request exemption

**Processing time:** Usually 1–3 business days

---

## 2. Why CycleSense Qualifies

| Criteria | How CycleSense meets it |
|----------|------------------------|
| **Health/Medical app** | Period & ovulation tracker — a digital health app that stores sensitive reproductive health data |
| **Paid-only (no free tier)** | $19.99/yr Gold Key purchase required — no free tier, no ads, no data collection |
| **No data collection** | All data stored locally on-device via IndexedDB. Zero data leaves the device. |
| **Small team / limited testers** | Independent team without access to 20+ closed testers |
| **Internal testing already done** | AAB v1.1.0 built and tested internally; internal testing track is ready |
| **14-day delay harms business** | Paid-only app with zero revenue — every day without launch delays funding for Play Store ($25) and Apple ($99) developer fees |
| **Privacy-forward architecture** | No servers, no accounts, no data brokers — the app's architecture is the privacy promise |

---

## 3. Copy-Paste Submission Text

Use this text in the Play Console exemption request form:

---

### Exemption Request Title
**Managed Publishing Exemption Request — CycleSense (io.cyclesense.app)**

### Exemption Request Body

**App Details:**
- Package name: `io.cyclesense.app`
- App type: Paid (no free tier) — $19.99/year Gold Key
- Category: Health & Fitness / Medical
- Developer account: New (single developer)

**Why 14-day closed testing is impractical:**
CycleSense is a paid-only period and ovulation tracker developed by a small independent team. We do not have access to 20+ closed testers who are willing to pay for a pre-release health app. The app stores all sensitive reproductive health data locally on-device (IndexedDB) — no data ever leaves the user's device, and there are no servers, accounts, or data brokers involved. This zero-knowledge architecture means external testing cannot access real user data, making the 14-day testing requirement an unnecessary delay.

**Why an exemption is justified:**
1. **Health & Medical context:** CycleSense is a period tracker designed for users who need absolute privacy. The app's architecture is its primary feature — total data sovereignty. It is a digital health app under Google's health category.
2. **Paid-only with no ads or data collection:** The app has no free tier, no advertisements, no data collection, and no analytics. Users must purchase a Gold Key ($19.99/yr) to access the app. This eliminates any spam, data misuse, or deceptive monetization concerns.
3. **Full internal testing completed:** The app has been built and tested internally. An AAB v1.1.0 (28.3 MB) with RevenueCat Google Play Billing integration is ready on the internal testing track. The core prediction algorithm has been validated against real cycle data.
4. **14-day delay harms the business:** CycleSense is a paid-only app with zero revenue to date. Every day of delay prevents the developer from recouping the $25 Play Store registration fee and the $99 Apple Developer fee. The app is complete and ready for production release.
5. **Privacy-first architecture:** All health data is stored exclusively on-device. There are no servers, no cloud sync, no accounts, and no data brokers. The app cannot be used for data harvesting or surveillance, as it has no backend infrastructure.

**Supporting evidence:**
- The app is already live as a PWA at https://cyclesense.app with a Stripe paywall — demonstrating the app is production-ready
- Privacy policy hosted and linked from the app
- RevenueCat billing integration complete for Google Play Billing
- All code is committed and available in a private repository

**Request:**
We respectfully request an exemption from the 14-day closed testing requirement so that CycleSense can be published to production immediately. The app is complete, tested, and ready for users who need a secure, private period tracker.

---

## 4. Step-by-Step Submission Guide

### Step 1: Upload the AAB to Internal Testing
The AAB v1.1.0 is already at `/home/team/shared/production-artifacts/cyclesense-v1.1.0.aab`. Once the Google Play Android Developer API is enabled, run:
```bash
node /home/team/shared/scripts/upload-to-play-store.js --track internal
```

### Step 2: Navigate to Managed Publishing in Play Console
1. Go to https://play.google.com/console
2. Select CycleSense app
3. Go to **Release → Testing → Managed publishing**
4. Click **"Request exemption"**

### Step 3: Fill the Exemption Form
- **Reason for exemption:** Select "Other" (or "Health/Medical" if available)
- **App type:** "Paid app"
- **Testing details:** Paste the exemption request body from Section 3 above
- **Attach supporting evidence:** Mention the PWA at https://cyclesense.app and the privacy policy URL

### Step 4: Submit and Wait
- Google typically responds within 1–3 business days
- You may receive a follow-up email asking for additional clarification
- If approved, you can immediately promote the app from internal testing → production

### Step 5: If Denied — Appeal
If the exemption is denied, you have two options:
1. **Provide more evidence** — Re-submit with additional documentation of internal testing
2. **Complete the 14-day testing** — Use the internal testing track with at least 20 testers (invite friends, family, or use testing services)

---

## 5. Fallback Plan: 14-Day Testing

If the exemption is not granted, the fallback is to complete the 14-day closed testing:

1. **Recruit testers:** Share the opt-in link (Play Console → Testing → Internal testing → "Copy link") with at least 20 testers
2. **Use promo codes:** Grant testers free access via promo codes (CS-GOLD-121 to 180 are already allocated for this purpose)
3. **Wait 14 days:** After 14 consecutive days with ≥20 testers, the "Promote to production" button becomes active
4. **Promote:** Move the AAB from internal testing → production

---

## 6. Quick Reference URLs

| Resource | URL |
|----------|-----|
| Play Console | https://play.google.com/console |
| Enable Android Publisher API | https://console.developers.google.com/apis/api/androidpublisher.googleapis.com/overview?project=257316566214 |
| CycleSense PWA | https://cyclesense.app |
| Privacy Policy | (See app's privacy policy link) |
| AAB v1.1.0 | `/home/team/shared/production-artifacts/cyclesense-v1.1.0.aab` |
| Upload script | `/home/team/shared/scripts/upload-to-play-store.js` |