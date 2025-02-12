// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // You can add custom fonts, colors, etc.
    },
  },
  plugins: [
    // (Optional) If you want to use typography
    require('@tailwindcss/typography'),
  ],
}