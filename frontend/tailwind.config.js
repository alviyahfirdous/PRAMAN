/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* PRAMAN clinical palette */
        navy: {
          50:  "#e8edf5",
          100: "#c5d1e6",
          200: "#9fb2d3",
          300: "#7893c0",
          400: "#587bb2",
          500: "#3963a4",
          600: "#1e4e8c",    /* primary nav */
          700: "#163a6b",
          800: "#0e2649",
          900: "#071428",
          950: "#030a14",
        },
        clinical: {
          50:  "#e6f2fb",
          100: "#bee0f5",
          200: "#90ccee",
          300: "#5eb5e7",
          400: "#36a2e2",
          500: "#1090dc",    /* clinical blue */
          600: "#0d82c8",
          700: "#0a70ae",
          800: "#085e95",
          900: "#044470",
        },
        teal: {
          50:  "#e0f5f4",
          100: "#b3e7e4",
          200: "#80d7d3",
          300: "#4dc7c1",
          400: "#27bbb4",
          500: "#00afa7",    /* validated/complete */
          600: "#009e96",
          700: "#008a83",
          800: "#007871",
          900: "#005750",
        },
        ochre: {
          50:  "#fdf8e1",
          100: "#faeeb3",
          200: "#f7e380",
          300: "#f4d74d",
          400: "#f2ce26",
          500: "#f0c600",    /* Ayurveda accent */
          600: "#d6af00",
          700: "#b09000",
          800: "#8a7100",
          900: "#635100",
        },
        terracotta: {
          50:  "#fdeee8",
          100: "#f9d4c5",
          200: "#f3b79f",
          300: "#ed9a79",
          400: "#e9845c",
          500: "#e46d3e",    /* attention/pending */
          600: "#d05e32",
          700: "#b84e28",
          800: "#9f3f1e",
          900: "#7d2f13",
        },
        maroon: {
          50:  "#fce8ec",
          100: "#f6c5ce",
          200: "#ef9fae",
          300: "#e8798d",
          400: "#e35d75",
          500: "#de415d",
          600: "#c73652",
          700: "#a92844",
          800: "#8b1b37",
          900: "#6a0d26",  /* critical safety */
        },
        ivory: {
          50:  "#fffef9",
          100: "#fefdf0",
          200: "#fdf9e1",
          300: "#fbf5cf",
          400: "#f9f0ba",
          500: "#f7eba3",  /* primary surface */
        },
        "slate-ink": "#1e2a3b",
        "cool-mist": "#e8f0f8",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
