import { getAll, getByKey, put, remove, STORES } from '../services/storage.js';
import { predictNextCycle, predictForecast } from '../services/prediction.js';

class AppState {
    settings = $state({
        userId: null,
        referralId: null,
        referredBy: null,
        typicalCycleLength: 28,
        typicalPeriodLength: 5,
        lastPeriodStart: null,
        ovulationTracking: true,
        onboarded: false,
        referralActivated: false,
        goldKey: null,
        isGuardian: false,
        guardianSince: null,
        isPremium: false,
        analyticsOptIn: false,
        analyticsPromptShown: false
    });

    cycles = $state([]);
    dayLogs = $state({}); // key: date, value: { date, symptoms: [] }
    predictions = $state([]); // historical predictions
    userCount = $state(8452); // Hardcoded for scarcity mechanism
    
    isPremium = $derived.by(() => {
        if (this.settings.isPremium) return true;
        if (this.settings.goldKey) {
            try {
                const key = typeof this.settings.goldKey === 'string' ? JSON.parse(this.settings.goldKey) : this.settings.goldKey;
                if (new Date(key.expiresAt) > new Date()) return true;
            } catch (e) {
                return false;
            }
        }
        return this.settings.isGuardian;
    });

    featureFlags = $derived({
        bayesianModel: this.isPremium,
        patternDetection: this.isPremium,
    });

    isScarcityActive = $derived(this.userCount < 10000);
    goldKeysRemaining = $derived(Math.max(0, 10000 - this.userCount));
    prediction = $derived(predictNextCycle(this.cycles, this.settings));
    forecast = $derived(predictForecast(this.cycles, this.settings));

    async init() {
        try {
            const storedSettings = await getAll(STORES.SETTINGS);
            storedSettings.forEach(s => {
                this.settings[s.key] = s.value;
            });

            if (!this.settings.userId) {
                const userId = crypto.randomUUID();
                await this.updateSetting('userId', userId);
            }

            if (!this.settings.referralId) {
                // Use the full userId as the referralId to allow server-side attribution without a DB
                await this.updateSetting('referralId', this.settings.userId);
            }

            this.cycles = await getAll(STORES.CYCLES);
            // Sort cycles by date newest first
            this.cycles.sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart));

            const storedLogs = await getAll(STORES.DAY_LOGS);
            storedLogs.forEach(log => {
                this.dayLogs[log.date] = log;
            });

            this.predictions = await getAll(STORES.PREDICTIONS);
        } catch (e) {
            console.error('Failed to initialize app state', e);
        }
    }

    async updateDayLog(date, symptoms) {
        const log = { date, symptoms };
        this.dayLogs[date] = log;
        await put(STORES.DAY_LOGS, log);
    }

    async updateSetting(key, value) {
        this.settings[key] = value;
        await put(STORES.SETTINGS, { key, value });
    }

    async addCycle(cycle) {
        // cycle: { id, periodStart, periodEnd }
        if (!cycle.id) cycle.id = crypto.randomUUID();

        const isFirstCycle = this.cycles.length === 0;

        // Capture current prediction for accuracy feedback later
        if (this.prediction && this.prediction.nextPeriodStart) {
            const currentPred = { ...this.prediction, id: crypto.randomUUID(), actualPeriodStart: cycle.periodStart, timestamp: Date.now() };
            this.predictions.push(currentPred);
            await put(STORES.PREDICTIONS, currentPred);
        }

        this.cycles.push(cycle);
        this.cycles.sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart));
        await put(STORES.CYCLES, cycle);

        // Track cycle logged event
        await this.recordEvent('cycle_logged');

        // If this is the first cycle and the user was referred, activate it
        if (isFirstCycle && !this.settings.referralActivated) {
            const { referralStore } = await import('./referralStore.svelte.js');
            if (referralStore.referredBy) {
                console.log('First cycle logged, activating referral...');
                await referralStore.activateReferral();
            }
        }
    }

    async updateCycle(cycle) {
        const index = this.cycles.findIndex(c => c.id === cycle.id);
        if (index !== -1) {
            this.cycles[index] = cycle;
            await put(STORES.CYCLES, cycle);
        }
    }

    async deleteCycle(id) {
        this.cycles = this.cycles.filter(c => c.id !== id);
        await remove(STORES.CYCLES, id);
    }

    async recordEvent(eventType, metadata = {}) {
        if (!this.settings.analyticsOptIn && eventType !== 'onboarding_complete') {
            // Note: We might want to allow onboarding_complete if we consider it part of the initial process
            // but the spec says "Client-side opt-in check required".
            // Actually, if they haven't opted in yet, we shouldn't send anything.
            return;
        }

        try {
            const clientHash = await this._hashString(this.settings.userId);
            const payload = {
                event_type: eventType,
                metadata,
                client_hash: clientHash
            };

            await fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error('Failed to record analytics event', e);
        }
    }

    async _hashString(str) {
        if (!str) return null;
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async completeOnboarding(lastPeriodStart, periodLength) {
        await this.updateSetting('lastPeriodStart', lastPeriodStart);
        await this.updateSetting('typicalPeriodLength', parseInt(periodLength));
        await this.updateSetting('onboarded', true);

        // Add the last period as the first logged cycle
        const startDate = new Date(lastPeriodStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(periodLength) - 1);

        await this.addCycle({
            periodStart: lastPeriodStart,
            periodEnd: endDate.toISOString().split('T')[0]
        });
    }
}

export const appState = new AppState();
