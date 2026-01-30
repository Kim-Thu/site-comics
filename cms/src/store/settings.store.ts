import { create } from 'zustand';
import { settingService } from '../infrastructure/api.service';

interface SettingsState {
    settings: any;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (data: any) => Promise<void>;
    applyTheme: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    loading: false,
    fetchSettings: async () => {
        set({ loading: true });
        try {
            const data = await settingService.getSettings();
            set({ settings: data });
            if (data.accentColor) {
                get().applyTheme(data.accentColor);
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            // Try to apply from local storage if API fails
            const savedColor = localStorage.getItem('accent-color');
            if (savedColor) get().applyTheme(savedColor);
        } finally {
            set({ loading: false });
        }
    },
    updateSettings: async (data: any) => {
        try {
            const updated = await settingService.updateSettings(data);
            set({ settings: updated });
            if (updated.accentColor) {
                get().applyTheme(updated.accentColor);
            }
        } catch (error) {
            console.error('Failed to update settings', error);
            throw error;
        }
    },
    applyTheme: (color: string) => {
        const root = document.documentElement;
        
        // Save to localStorage to prevent flicker on next load
        localStorage.setItem('accent-color', color);

        // Convert hex to rgb
        let r = 99, g = 102, b = 241; // default indigo
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        }

        root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }
}));
