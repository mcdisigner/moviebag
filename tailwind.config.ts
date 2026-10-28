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
        background: {
          primary: "#050508",
          secondary: "#0D0E15",
          elevated: "#141623",
        },
        surface: {
          glass: "rgba(20, 22, 35, 0.72)",
          "glass-subtle": "rgba(15, 17, 28, 0.5)",
          "glass-hover": "rgba(30, 34, 55, 0.8)",
          card: "rgba(18, 20, 32, 0.85)",
        },
        border: {
          glass: "rgba(255, 255, 255, 0.09)",
          "glass-hover": "rgba(255, 255, 255, 0.18)",
        },
        accent: {
          primary: "#E50914",
          "primary-hover": "#F40612",
          secondary: "#6366F1",
          "secondary-hover": "#4F46E5",
          gold: "#F59E0B",
          emerald: "#10B981",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
          subtle: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        sinhala: ["var(--font-sinhala)", "Noto Sans Sinhala", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "glow-red":
          "radial-gradient(circle at 50% 50%, rgba(229, 9, 20, 0.18) 0%, transparent 70%)",
        "glow-indigo":
          "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
        "glass-glow": "0 0 25px -5px rgba(99, 102, 241, 0.35)",
        "card-hover": "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px 2px rgba(229, 9, 20, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ambient-shift": "ambientShift 12s ease infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        ambientShift: {
          "0%": { transform: "scale(1) translate(0px, 0px)" },
          "100%": { transform: "scale(1.08) translate(15px, -10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
