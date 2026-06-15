# CycleSense

A highly accurate, privacy-first period and ovulation tracker featuring a minimalist, feminine interface and zero-friction onboarding.

## Features

- **Privacy-First**: No data leaves your device. All tracking data is stored locally in IndexedDB.
- **Accurate Predictions**: Adaptive algorithm that learns from your cycle history.
- **Minimalist Design**: A "Feminine Purple" aesthetic that is calm, supportive, and empowering.
- **Premium Insights**: Advanced health reports and 6-month forecasting for premium subscribers.
- **Hybrid Monetization**: Ad-supported free tier with a non-intrusive, privacy-focused experience.
- **PWA Support**: Installable on your home screen with full offline support.

## Tech Stack

- **Frontend**: Svelte 5 (Runes), Tailwind CSS
- **Icons**: Lucide Svelte
- **Storage**: IndexedDB (local-first)
- **Payments**: Stripe Checkout
- **Entitlements**: RevenueCat (Web SDK)
- **Ads**: EthicalAds (Privacy-focused)
- **Deployment**: Vercel

## Getting Started

### Development

```sh
npm install
npm run dev
```

### Production Build

```sh
npm run build
```

## PWA Installation

CycleSense is a Progressive Web App (PWA). You can install it on your device:
- **iOS**: Tap "Share" and "Add to Home Screen".
- **Android/Chrome**: Tap the "Install" prompt or "Add to Home Screen" in the menu.

## Deployment on Vercel

This project is optimized for deployment on Vercel. 

1. Push the code to a GitHub repository.
2. Connect the repository to Vercel.
3. Configure the following environment variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key.
   - `REVENUECAT_API_KEY`: Your RevenueCat public API key.
   - `STRIPE_WEBHOOK_SECRET`: For subscription sync (optional but recommended).

## Mobile App (Capacitor)

CycleSense can be wrapped as a native mobile app for iOS and Android using Capacitor.

### Prerequisites

- **iOS**: macOS with Xcode installed.
- **Android**: Android Studio installed.

### Build and Sync

To build the web project and sync it with the native platforms:

```sh
npm run mobile:build
```

### Open in IDE

To open the project in Xcode or Android Studio:

```sh
# iOS
npm run mobile:ios

# Android
npm run mobile:android
```

### Asset Generation

To regenerate icons and splash screens from the `assets/` directory:

```sh
npm run mobile:assets
```

## License

Proprietary. All rights reserved.
