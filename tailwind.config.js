/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/*.{js,ts,jsx,tsx,html}",
    "./public/*.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Nueva paleta de colores oscuros
        "dark-bg": "#1e1f23",
        "dark-surface": "#404147",
        "dark-red": "#9d3d3d",
        "dark-coral": "#ce7c73",
        "dark-rose": "#f9e1dd",
        "dark-blue-gray": "#7c828d",

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
        "macos-border": "rgba(124, 130, 141, 0.2)",
        "macos-border-dark": "rgba(124, 130, 141, 0.1)",
        macos: {
          // Colores sistema macOS actualizados
          blue: "#007AFF",
          indigo: "#5856D6",
          purple: "#AF52DE",
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
      fontFamily: {
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["SF Mono", "Monaco", "Cascadia Code", "Consolas", "monospace"],
      },
      fontSize: {
        "title-1": ["2rem", { lineHeight: "2.375rem", fontWeight: "700" }],
        "title-2": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        "title-3": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        headline: ["1.0625rem", { lineHeight: "1.375rem", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.375rem", fontWeight: "400" }],
        "caption-1": ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        "caption-2": [
          "0.6875rem",
          { lineHeight: "0.875rem", fontWeight: "400" },
        ],
      },
      spacing: {
        18: "4.5rem",
        70: "17.5rem",
        88: "22rem",
      },
      borderRadius: {
        // macOS System Corner Radius
        "macos-xs": "0.25rem", // 4px - Small elements
        "macos-sm": "0.375rem", // 6px - Buttons, inputs
        macos: "0.5rem", // 8px - Cards, panels
        "macos-md": "0.625rem", // 10px - Modal dialogs
        "macos-lg": "0.75rem", // 12px - Large panels
        "macos-xl": "1rem", // 16px - Windows, major containers
        "macos-2xl": "1.25rem", // 20px - Very large containers
      },
      boxShadow: {
        macos: "0 4px 16px rgba(0, 0, 0, 0.1)",
        "macos-lg": "0 8px 32px rgba(0, 0, 0, 0.12)",
        "macos-inset": "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        titlebar: "0 1px 0 rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
        macos: "20px",
        "macos-lg": "25px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-gentle":
          "bounceGentle 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "main-bg": "url('./assets/bck.png')",
      },
      zIndex: {
        dropdown: "999999",
        "dropdown-overlay": "999998",
        modal: "1000000",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    // Plugin personalizado para scrollbars
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgba(124, 130, 141, 0.3) transparent",
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "6px",
        },
        ".scrollbar-thin::-webkit-scrollbar-track": {
          background: "transparent",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(124, 130, 141, 0.3)",
          borderRadius: "3px",
          border: "none",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(124, 130, 141, 0.5)",
        },
        ".scrollbar-track-transparent::-webkit-scrollbar-track": {
          background: "transparent",
        },
        ".scrollbar-thumb-dark-blue-gray\\/30::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(124, 130, 141, 0.3)",
        },
        ".hover\\:scrollbar-thumb-dark-blue-gray\\/50:hover::-webkit-scrollbar-thumb":
          {
            backgroundColor: "rgba(124, 130, 141, 0.5)",
          },
      };
      addUtilities(newUtilities);
    },
  ],
};
