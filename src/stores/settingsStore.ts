// todo: create a simple zustand store to handle local settings of the application
// By now we only got the following ones:
// 1. sound preferences
// 2. theme preferences
//
// We can add these later:
// 3. language preferences
// 4. notification preferences
// 5. currency preferences

import { create } from "zustand";

type SettingsStore = {
  soundPreferences: boolean;
  themePreferences: "light" | "dark";
  toggleSoundPreferences: () => void;
  toggleThemePreferences: () => void;
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  soundPreferences: true,
  themePreferences: "dark",
  toggleSoundPreferences: () =>
    set((state) => ({ soundPreferences: !state.soundPreferences })),
  toggleThemePreferences: () =>
    set((state) => ({
      themePreferences: state.themePreferences === "light" ? "dark" : "light",
    })),
}));
