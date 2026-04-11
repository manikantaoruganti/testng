/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        surface: "#FFFFFF",
        primary: "#4F46E5",
        secondary: "#6366F1",
        accent: "#F59E0B",
        success: "#10B981",
        warning: "#FBBF24",
        error: "#EF4444",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB"
      }
    }
  },
  plugins: [],
};

