import { appState } from './appState.svelte.js';

class I18nStore {
    locale = $state('en');
    
    translations = {
        en: {
            calendar: "Calendar",
            history: "History",
            insights: "Insights",
            guides: "Guides",
            settings: "Settings",
            premium: "Premium",
            privacy: "Privacy",
            dataSovereignty: "Data Sovereignty",
            coreMessage: "The period tracker Big Tech can't subpoena.",
            heroTitle: "Zero accounts. Zero cloud. Zero worries.",
            heroSubtitle: "Track your cycle on your own terms with CycleSense.",
            back: "Back",
            close: "Close"
        },
        de: {
            calendar: "Kalender",
            history: "Verlauf",
            insights: "Einblicke",
            guides: "Ratgeber",
            settings: "Einstellungen",
            premium: "Premium",
            privacy: "Privatsphäre",
            dataSovereignty: "Datensouveränität",
            coreMessage: "Ihre Gesundheitsdaten gehören nur Ihnen.",
            heroTitle: "Sicherer Perioden-Tracker.",
            heroSubtitle: "Keine Cloud, kein Konto, kein Tracking. 100 % lokal auf Ihrem Gerät.",
            back: "Zurück",
            close: "Schließen"
        },
        br: {
            calendar: "Calendário",
            history: "Histórico",
            insights: "Análises",
            guides: "Guias",
            settings: "Configurações",
            premium: "Premium",
            privacy: "Privacidade",
            dataSovereignty: "Autonomia e Praticidade",
            coreMessage: "Monitore seu ciclo sem comprometer sua privacidade.",
            heroTitle: "O rastreador de período que respeita você.",
            heroSubtitle: "Sem conta, sem burocracia, apenas o que você precisa.",
            back: "Voltar",
            close: "Fechar"
        },
        jp: {
            calendar: "カレンダー",
            history: "履歴",
            insights: "分析",
            guides: "ガイド",
            settings: "設定",
            premium: "プレミアム",
            privacy: "プライバシー",
            dataSovereignty: "ミニマリズムと正確さ",
            coreMessage: "あなたの体に、静かな安心を。",
            heroTitle: "究極にシンプルな生理管理。",
            heroSubtitle: "アカウント登録不要。あなたのデータは、あなたのデバイスの中だけに。",
            back: "戻る",
            close: "閉じる"
        }
    };

    init() {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('cs_locale');
            if (savedLocale && this.translations[savedLocale]) {
                this.locale = savedLocale;
            } else {
                // Try to detect browser language
                const browserLang = navigator.language.split('-')[0];
                if (this.translations[browserLang]) {
                    this.locale = browserLang;
                }
            }
        }
    }

    setLocale(newLocale) {
        if (this.translations[newLocale]) {
            this.locale = newLocale;
            if (typeof window !== 'undefined') {
                localStorage.setItem('cs_locale', newLocale);
            }
        }
    }

    t(key) {
        return this.translations[this.locale][key] || this.translations['en'][key] || key;
    }
}

export const i18n = new I18nStore();
