import { createContext } from "react";

export type SupportedLanguage = "en" | "zh" | "zh-cn" | "es";

export const DEFAULT_LANG =
  (process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE as SupportedLanguage) || "en";

export const LanguageContext = createContext({
  language: DEFAULT_LANG as SupportedLanguage,
  setLanguage: (lang: SupportedLanguage) => {},
});

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: (val?: any) => {},
});
