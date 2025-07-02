import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  effectiveTheme: "light" | "dark";
}

const THEME_STORAGE_KEY = "app-theme";

// Función para detectar el tema del sistema
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Función para obtener el tema efectivo
const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
  return theme === "system" ? getSystemTheme() : theme;
};

// Función para aplicar el tema al DOM
const applyTheme = (effectiveTheme: "light" | "dark") => {
  const root = document.documentElement;

  if (effectiveTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // Obtener tema guardado o usar 'system' por defecto
    const savedTheme =
      (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
    const effectiveTheme = getEffectiveTheme(savedTheme);

    return {
      theme: savedTheme,
      effectiveTheme,
    };
  });

  // Función para cambiar el tema
  const setTheme = useCallback((newTheme: Theme) => {
    const effectiveTheme = getEffectiveTheme(newTheme);

    setThemeState({
      theme: newTheme,
      effectiveTheme,
    });

    // Guardar en localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Aplicar al DOM
    applyTheme(effectiveTheme);
  }, []);

  // Efecto para escuchar cambios en el tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeState.theme === "system") {
        const newEffectiveTheme = e.matches ? "dark" : "light";
        setThemeState(prev => ({
          ...prev,
          effectiveTheme: newEffectiveTheme,
        }));
        applyTheme(newEffectiveTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themeState.theme]);

  // Efecto inicial para aplicar el tema
  useEffect(() => {
    applyTheme(themeState.effectiveTheme);
  }, []);

  // Efecto para aplicar cambios de tema efectivo
  useEffect(() => {
    applyTheme(themeState.effectiveTheme);
  }, [themeState.effectiveTheme]);

  return {
    theme: themeState.theme,
    effectiveTheme: themeState.effectiveTheme,
    setTheme,
    isDark: themeState.effectiveTheme === "dark",
    isLight: themeState.effectiveTheme === "light",
  };
};

export default useTheme;
