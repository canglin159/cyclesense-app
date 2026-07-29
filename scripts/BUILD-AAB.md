# Build AAB v1.1.0 — RevenueCat Google Play Billing

## Build Requirements (not available in sandbox)

- **Java JDK 21** (the Android Gradle plugin targets Java 21)
- **Android SDK** with:
  - `build-tools` (matching compileSdk)
  - `platforms/android-35` (or whatever `compileSdkVersion` resolves to)
  - Android SDK location set via `ANDROID_HOME` or `ANDROID_SDK_ROOT`
- **Gradle wrapper** included at `android/gradlew`
- **Node.js + npm** (for Capacitor sync)

## Steps to Build

### 1. Sync Capacitor plugins
```bash
cd /home/team/shared/cyclesense-app
npm run mobile:build   # runs: vite build → capacitor-assets generate → npx cap sync
```
This will:
- Build the web app (SvelteKit → static build)
- Generate mobile assets (icons, splash)
- Sync Capacitor plugins into the `android/` native project
- When the RevenueCat Capacitor plugin syncs, it will regenerate:
  - `android/capacitor.settings.gradle` (includes `:capacitor-revenuecat-purchases`)
  - `android/app/capacitor.build.gradle` (dependencies)

### 2. Build the AAB (Android App Bundle)
```bash
cd android
./gradlew bundleRelease
```

### 3. Locate the AAB
The built AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Copy to shared artifacts
```bash
cp android/app/build/outputs/bundle/release/app-release.aab \
   /home/team/shared/production-artifacts/cyclesense-v1.1.0.aab
```

### 5. Signing
The release signing config reads from:
```
android/release-signing.properties
```
Create this file with:
```properties
STORE_FILE=/path/to/keystore.jks
STORE_PASSWORD=your_store_password
KEY_ALIAS=your_key_alias
KEY_PASSWORD=your_key_password
```

Without this file, the APK/AAB will be unsigned (debug signed).

## Google Play Upload
After building, use the upload script:
```bash
node /home/team/shared/scripts/upload-to-play-store.js
```

## What's In This Build

Files committed on branch `fix/vercel-output-directory` (commit `e79e84c`):

| File | Change |
|------|--------|
| `package.json` | Added `@revenuecat/purchases-capacitor-ui`, `@revenuecat/purchases-js`, `@revenuecat/purchases-ui-js` |
| `package-lock.json` | Lockfile updated |
| `android/capacitor.settings.gradle` | Includes `:capacitor-revenuecat-purchases` |
| `android/app/capacitor.build.gradle` | `implementation project(':capacitor-revenuecat-purchases')` |
| `src/lib/stores/premiumStore.svelte.js` | Platform-aware store (native uses `@revenuecat/purchases-capacitor`, web uses `@revenuecat/purchases-js`) |
| `src/lib/components/Paywall.svelte` | Platform-aware UI with Google Play Billing (native) vs Stripe (web) |

## Environment Variables Required

- `VITE_REVENUECAT_PUBLIC_KEY` — RevenueCat public API key (defaults to test key)
- `STRIPE_SECRET_KEY` — For web Stripe purchases
- `VITE_STRIPE_PRICE_ID` — Stripe price ID for Gold Key

## RevenueCat In-App Product IDs

| SKU | Type | Price |
|-----|------|-------|
| `gold_key_annual` | Subs (annual) | $19.99/yr |
| `standard_monthly` | Subs (monthly) | $9.99/mo |

Configure these in the RevenueCat dashboard under [Products](https://app.revenuecat.com/products).