/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          sidebar: "#07182c",
          sidebarHover: "#0d223c",
          sidebarActive: "#087cf5",
          sidebarText: "#8496b0",
          headerBg: "#ffffff",
          pageBg: "#f4f8fc",
          cardBg: "#ffffff",
          border: "#e5edf5",
          primary: "#087cf5",
          primaryHover: "#006be6",
          textDark: "#101d37",
          textMuted: "#52627a",
          textLight: "#8496b0",
          kpiBlue: "#e3effb",
          kpiGreen: "#def8ef",
          kpiYellow: "#fef6e1",
          kpiPink: "#fde2eb",
          kpiPurple: "#efe6fb",
          kpiCyan: "#e2efff",
          kpiMint: "#e3f8f1",
          badgeGreen: "#dcfce7",
          badgeGreenText: "#15803d",
          badgeYellow: "#fef3c7",
          badgeYellowText: "#b45309",
          badgePurple: "#ede9fe",
          badgePurpleText: "#6d28d9",
          badgePink: "#ffe4e6",
          badgePinkText: "#be123c",
          badgeBlue: "#e0f2fe",
          badgeBlueText: "#0369a1",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'crm-card': '0 1px 3px 0 rgba(16, 29, 55, 0.04), 0 1px 2px -1px rgba(16, 29, 55, 0.04)',
        'crm-modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
