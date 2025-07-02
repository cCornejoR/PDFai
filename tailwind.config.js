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
        // Nueva paleta de colores oscuros
        "dark-bg": "#1e1f23",
        "dark-surface": "#404147",
        "dark-red": "#9d3d3d",
        "dark-coral": "#ce7c73",
        "dark-rose": "#f9e1dd",
        "dark-blue-gray": "#7c828d",

        // Nueva paleta de colores claros
        "light-bg": "#ffffff",
        "light-surface": "#f8f9fa",
        "light-secondary": "#e9ecef",
        "light-border": "#dee2e6",
        "light-text": "#212529",
        "light-text-secondary": "#6c757d",
        "light-accent": "#0066cc",
        "light-accent-hover": "#0052a3",

        // Colores sistema macOS Sonoma/Ventura
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        "macos-blue": "#007AFF",
        "macos-red": "#FF5F57",
        "macos-orange": "#FFBD2E",
        "macos-green": "#28CA42",
        "macos-border": "rgba(124, 130, 141, 0.2)",
        "macos-border-dark": "rgba(124, 130, 141, 0.1)",
        macos: {
          // Colores sistema macOS actualizados
          blue: "#007AFF",
          indigo: "#5856D6",

          pink: "#FF2D92",
          red: "#9d3d3d",
          orange: "#ce7c73",
          yellow: "#f9e1dd",
          green: "#32D74B",
          mint: "#66D4CF",
          teal: "#6AC4DC",
          cyan: "#5AC8F5",
          // Fondos específicos macOS con nueva paleta
          sidebar: "#404147",
          "sidebar-dark": "#1e1f23",
          "window-bg": "#f9e1dd",
          "window-bg-dark": "#1e1f23",
          "content-bg": "#f9e1dd",
          "content-bg-dark": "#404147",
          // Superficie y overlay
          surface: "#ce7c73",
          "surface-dark": "#404147",
          overlay: "rgba(30, 31, 35, 0.4)",
          "overlay-dark": "rgba(30, 31, 35, 0.6)",
          // Bordes
          border: "rgba(124, 130, 141, 0.2)",
          "border-dark": "rgba(124, 130, 141, 0.1)",
        },
      },
      // Enhanced gradient configurations
      backgroundImage: {
        // Dark mode gradients
        "gradient-dark-primary":
          "linear-gradient(135deg, #1e1f23 0%, #404147 100%)",
        "gradient-dark-secondary":
          "linear-gradient(135deg, #404147 0%, #9d3d3d 100%)",
        "gradient-dark-accent":
          "linear-gradient(135deg, #9d3d3d 0%, #ce7c73 100%)",
        "gradient-dark-surface":
          "linear-gradient(135deg, #404147 0%, #1e1f23 100%)",
        "gradient-dark-glass":
          "linear-gradient(135deg, rgba(30, 31, 35, 0.8) 0%, rgba(64, 65, 71, 0.6) 100%)",

        // Light mode gradients
        "gradient-light-primary":
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        "gradient-light-secondary":
          "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        "gradient-light-accent":
          "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
        "gradient-light-surface":
          "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        "gradient-light-glass":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.6) 100%)",

        // macOS-style gradients
        "gradient-macos-window":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
        "gradient-macos-window-dark":
          "linear-gradient(180deg, rgba(30, 31, 35, 0.8) 0%, rgba(30, 31, 35, 0.4) 100%)",
        "gradient-macos-sidebar":
          "linear-gradient(180deg, rgba(206, 124, 115, 0.6) 0%, rgba(157, 61, 61, 0.4) 100%)",
        "gradient-macos-sidebar-dark":
          "linear-gradient(180deg, rgba(64, 65, 71, 0.6) 0%, rgba(30, 31, 35, 0.4) 100%)",
      },
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
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "glass-shimmer": "glassShimmer 2s ease-in-out infinite",
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
      },
      // Enhanced z-index scale for proper layering
      zIndex: {
        dropdown: "1000",
        modal: "2000",
        tooltip: "3000",
        titlebar: "9999",
        overlay: "9998",
      },
    },
  },
};
