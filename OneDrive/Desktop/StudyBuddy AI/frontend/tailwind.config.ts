import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0f5f2", 100: "#e1ebe5", 200: "#c9d9d0",
          300: "#718c7e", 400: "#607b6d", 500: "#587566",
          600: "#536f61", 700: "#435a4f", 800: "#37483f", 900: "#2d3b34",
        },
        purple: {
          300: "#718c7e", 400: "#607b6d", 500: "#587566",
          600: "#536f61", 700: "#435a4f", 800: "#37483f",
        },
        green: { 300: "#718b76", 400: "#56735d", 500: "#486b52", 700: "#375341" },
        red: { 300: "#bb8b83", 400: "#a3655b", 500: "#97554b", 700: "#783f38" },
        yellow: { 300: "#c0aa79", 400: "#8a7042", 500: "#806536", 700: "#685229" },
        blue: { 300: "#91a8b8", 400: "#59798f", 500: "#4e6f86", 700: "#3f5f75" },
        dark: {
          50:  "#fbfaf8", 100: "#272521", 200: "#37352f",
          300: "#53504b", 400: "#716d66", 500: "#88847d",
          600: "#aaa69e", 700: "#dedbd4", 800: "#f0efeb",
          900: "#ffffff", 950: "#f7f6f3",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow":     "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow":    "bounce 2s infinite",
        "fade-in":        "fadeIn 0.5s ease-in-out",
        "slide-up":       "slideUp 0.4s ease-out",
        "recording-ring": "recordingRing 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:      { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        recordingRing:{ "0%, 100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.4)" }, "50%": { boxShadow: "0 0 0 12px rgba(239,68,68,0)" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #f7f6f3 0%, #ffffff 50%, #f0efeb 100%)",
      },
    },
  },
  plugins: [],
};

export default config;