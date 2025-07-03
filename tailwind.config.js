/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        bricolage: ['"Bricolage Grotesque"', "sans-serif"],
        sans: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // ===== COLORES OFICIALES APPLE/macOS =====
        apple: {
          // Colores del sistema Apple oficiales (de Human Interface Guidelines)
          blue: "#007AFF", // Apple Blue - Color principal del sistema
          indigo: "#5856D6", // Apple Purple/Indigo
          purple: "#AF52DE", // Apple Purple
          pink: "#FF2D92", // Apple Pink
          red: "#FF3B30", // Apple Red - Sistema
          orange: "#FF9500", // Apple Orange
          yellow: "#FFCC00", // Apple Yellow
          green: "#32D74B", // Apple Green - Sistema
          mint: "#00C7BE", // Apple Mint (nuevo en macOS)
          teal: "#5AC8FA", // Apple Teal/Cyan
          cyan: "#5AC8FA", // Apple Cyan

          // Tonos secundarios y variaciones
          "blue-light": "#5AC8FA",
          "blue-dark": "#0051D0",
          "red-light": "#FF5F57",
          "red-dark": "#D70015",
          "green-light": "#30D158",
          "green-dark": "#248A3D",
          "orange-light": "#FFBD2E",
          "orange-dark": "#FF8C00",
          "purple-light": "#BF5AF2",
          "purple-dark": "#8E44AD",
        },

        // ===== COLORES SISTEMA macOS =====
        macos: {
          // Grises del sistema macOS (actualizados para Sonoma/Ventura)
          gray: {
            50: "#FAFAFA", // Casi blanco
            100: "#F5F5F7", // Gris muy claro
            200: "#E5E5E7", // Gris claro
            300: "#D1D1D6", // Gris medio claro
            400: "#8E8E93", // Gris medio
            500: "#636366", // Gris medio oscuro
            600: "#48484A", // Gris oscuro
            700: "#3A3A3C", // Gris muy oscuro
            800: "#2C2C2E", // Casi negro
            900: "#1C1C1E", // Negro suave
          },

          // Fondos específicos macOS
          "window-bg": "#FFFFFF", // Fondo ventana claro
          "window-bg-dark": "#1E1E1E", // Fondo ventana oscuro
          "sidebar-bg": "#F5F5F7", // Sidebar claro
          "sidebar-bg-dark": "#2C2C2E", // Sidebar oscuro
          "toolbar-bg": "#FAFAFA", // Toolbar claro
          "toolbar-bg-dark": "#3A3A3C", // Toolbar oscuro

          // Superficie con transparencia (glassmorphism)
          "glass-light": "rgba(255, 255, 255, 0.8)",
          "glass-dark": "rgba(28, 28, 30, 0.8)",
          "glass-sidebar": "rgba(245, 245, 247, 0.8)",
          "glass-sidebar-dark": "rgba(44, 44, 46, 0.8)",

          // Bordes y separadores
          "border-light": "rgba(0, 0, 0, 0.1)",
          "border-dark": "rgba(255, 255, 255, 0.1)",
          "separator-light": "rgba(60, 60, 67, 0.13)",
          "separator-dark": "rgba(84, 84, 88, 0.6)",

          // Estados de control
          "control-bg": "#FFFFFF",
          "control-bg-dark": "#48484A",
          "control-bg-hover": "#F0F0F0",
          "control-bg-hover-dark": "#5A5A5C",
          "control-bg-active": "#E0E0E0",
          "control-bg-active-dark": "#6D6D6F",
        },

        // ===== PALETA EXTENDIDA INSPIRADA EN APPLE =====
        // Colores inspirados en wallpapers de macOS Sonoma/Ventura
        sonoma: {
          // Inspirado en macOS Sonoma
          "sunset-orange": "#FF6B35",
          "sunset-pink": "#FF8E9B",
          "sunset-purple": "#C77DFF",
          "mountain-blue": "#7209B7",
          "mountain-green": "#2D7D32",
          "sky-blue": "#87CEEB",
          "grass-green": "#8BC34A",
          "earth-brown": "#8D6E63",
        },

        ventura: {
          // Inspirado en macOS Ventura
          "wave-blue": "#1976D2",
          "wave-teal": "#00BCD4",
          "wave-purple": "#7B1FA2",
          "cliff-orange": "#FF7043",
          "cliff-red": "#E53935",
          "sea-blue": "#0277BD",
          "sea-green": "#00695C",
        },

        // ===== COLORES LEGACY (manteniendo tu paleta actual) =====
        "dark-bg": "#1e1f23",
        "dark-surface": "#404147",
        "dark-red": "#9d3d3d",
        "dark-coral": "#ce7c73",
        "dark-rose": "#f9e1dd",
        "dark-blue-gray": "#7c828d",

        "light-bg": "#ffffff",
        "light-surface": "#f8f9fa",
        "light-secondary": "#e9ecef",
        "light-border": "#dee2e6",
        "light-text": "#212529",
        "light-text-secondary": "#6c757d",
        "light-accent": "#0066cc",
        "light-accent-hover": "#0052a3",
      },

      // ===== GRADIENTES INSPIRADOS EN APPLE =====
      backgroundImage: {
        // === Gradientes macOS Oficiales ===
        "gradient-macos-blue":
          "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
        "gradient-macos-purple":
          "linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)",
        "gradient-macos-pink":
          "linear-gradient(135deg, #FF2D92 0%, #AF52DE 100%)",
        "gradient-macos-orange":
          "linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)",
        "gradient-macos-red":
          "linear-gradient(135deg, #FF3B30 0%, #FF2D92 100%)",
        "gradient-macos-green":
          "linear-gradient(135deg, #32D74B 0%, #00C7BE 100%)",

        // === Gradientes de fondo del sistema ===
        "gradient-macos-window":
          "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)",
        "gradient-macos-window-dark":
          "linear-gradient(180deg, #1E1E1E 0%, #1C1C1E 100%)",
        "gradient-macos-sidebar":
          "linear-gradient(180deg, #F5F5F7 0%, #E5E5E7 100%)",
        "gradient-macos-sidebar-dark":
          "linear-gradient(180deg, #2C2C2E 0%, #3A3A3C 100%)",

        // === Gradientes glassmorphism ===
        "gradient-glass-light":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)",
        "gradient-glass-dark":
          "linear-gradient(135deg, rgba(28, 28, 30, 0.9) 0%, rgba(44, 44, 46, 0.6) 100%)",
        "gradient-glass-blue":
          "linear-gradient(135deg, rgba(0, 122, 255, 0.8) 0%, rgba(90, 200, 250, 0.4) 100%)",
        "gradient-glass-purple":
          "linear-gradient(135deg, rgba(175, 82, 222, 0.8) 0%, rgba(88, 86, 214, 0.4) 100%)",

        // === Gradientes inspirados en wallpapers de macOS ===
        // Sonoma inspired
        "gradient-sonoma-sunset":
          "linear-gradient(135deg, #FF6B35 0%, #FF8E9B 50%, #C77DFF 100%)",
        "gradient-sonoma-mountain":
          "linear-gradient(135deg, #7209B7 0%, #2D7D32 50%, #8BC34A 100%)",
        "gradient-sonoma-sky":
          "linear-gradient(135deg, #87CEEB 0%, #7209B7 100%)",

        // Ventura inspired
        "gradient-ventura-wave":
          "linear-gradient(135deg, #1976D2 0%, #00BCD4 50%, #7B1FA2 100%)",
        "gradient-ventura-cliff":
          "linear-gradient(135deg, #FF7043 0%, #E53935 100%)",
        "gradient-ventura-sea":
          "linear-gradient(135deg, #0277BD 0%, #00695C 100%)",

        // === Gradientes sutiles para UI ===
        "gradient-subtle-light":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(245, 245, 247, 0.1) 100%)",
        "gradient-subtle-dark":
          "linear-gradient(135deg, rgba(44, 44, 46, 0.05) 0%, rgba(58, 58, 60, 0.1) 100%)",
        "gradient-hover-light":
          "linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.1) 100%)",
        "gradient-hover-dark":
          "linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.2) 100%)",

        // === Gradientes para botones ===
        "gradient-button-primary":
          "linear-gradient(135deg, #007AFF 0%, #0051D0 100%)",
        "gradient-button-secondary":
          "linear-gradient(135deg, #8E8E93 0%, #636366 100%)",
        "gradient-button-success":
          "linear-gradient(135deg, #32D74B 0%, #248A3D 100%)",
        "gradient-button-warning":
          "linear-gradient(135deg, #FF9500 0%, #FF8C00 100%)",
        "gradient-button-danger":
          "linear-gradient(135deg, #FF3B30 0%, #D70015 100%)",

        // === Gradientes legacy (manteniendo tu configuración) ===
        "gradient-dark-primary":
          "linear-gradient(135deg, #1e1f23 0%, #404147 100%)",
        "gradient-dark-secondary":
          "linear-gradient(135deg, #404147 0%, #9d3d3d 100%)",
        "gradient-dark-accent":
          "linear-gradient(135deg, #9d3d3d 0%, #ce7c73 100%)",
        "gradient-light-primary":
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        "gradient-light-secondary":
          "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        "gradient-light-accent":
          "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
      },

      // ===== EFECTOS DE BLUR ESTILO macOS =====
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        // Efectos específicos macOS
        "macos-light": "20px", // Blur para glassmorphism claro
        "macos-medium": "30px", // Blur para glassmorphism medio
        "macos-heavy": "40px", // Blur para glassmorphism intenso
        glass: "30px",
      },

      backdropSaturate: {
        25: ".25",
        50: ".5",
        75: ".75",
        100: "1",
        125: "1.25",
        150: "1.5",
        175: "1.75",
        200: "2",
        glass: "1.8",
        macos: "1.2", // Saturación típica de macOS
      },

      // ===== ANIMACIONES ESTILO APPLE =====
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "glass-shimmer": "glassShimmer 2s ease-in-out infinite",

        // Animaciones específicas macOS
        "macos-bounce":
          "macosBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "macos-scale": "macosScale 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "macos-glow": "macosGlow 2s ease-in-out infinite alternate",
        "macos-float": "macosFloat 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glassShimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },

        // Keyframes específicos macOS
        macosBounce: {
          "0%": { transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        macosScale: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        macosGlow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 122, 255, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 122, 255, 0.8)" },
        },
        macosFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      // ===== BOX SHADOWS ESTILO macOS =====
      boxShadow: {
        // Sombras del sistema macOS
        "macos-sm":
          "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        "macos-md":
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        "macos-lg":
          "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
        "macos-xl":
          "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",

        // Sombras específicas para componentes
        "macos-window":
          "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "macos-modal": "0 25px 50px rgba(0, 0, 0, 0.25)",
        "macos-dropdown": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "macos-button":
          "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        "macos-card": "0 2px 8px rgba(0, 0, 0, 0.1)",

        // Sombras con color
        "macos-blue": "0 4px 14px rgba(0, 122, 255, 0.3)",
        "macos-purple": "0 4px 14px rgba(175, 82, 222, 0.3)",
        "macos-green": "0 4px 14px rgba(50, 215, 75, 0.3)",
        "macos-red": "0 4px 14px rgba(255, 59, 48, 0.3)",
      },

      // ===== BORDER RADIUS ESTILO macOS =====
      borderRadius: {
        "macos-sm": "6px", // Radius pequeño típico de macOS
        "macos-md": "8px", // Radius medio típico de macOS
        "macos-lg": "12px", // Radius grande típico de macOS
        "macos-xl": "16px", // Radius extra grande
        "macos-2xl": "20px", // Radius muy grande
        "macos-window": "12px", // Radius de ventanas macOS
        "macos-button": "6px", // Radius de botones macOS
        "macos-card": "12px", // Radius de cards macOS
      },

      // ===== Z-INDEX MEJORADO =====
      zIndex: {
        dropdown: "1000",
        modal: "2000",
        tooltip: "3000",
        titlebar: "9999",
        overlay: "9998",
        "macos-window": "100",
        "macos-sidebar": "200",
        "macos-toolbar": "300",
        "macos-popover": "400",
      },

      // ===== SPACING ESTILO macOS =====
      spacing: {
        "macos-xs": "4px", // Spacing extra pequeño
        "macos-sm": "8px", // Spacing pequeño
        "macos-md": "12px", // Spacing medio
        "macos-lg": "16px", // Spacing grande
        "macos-xl": "24px", // Spacing extra grande
        "macos-2xl": "32px", // Spacing muy grande
      },
    },
  },
};
