/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 80px rgba(236, 72, 153, 0.18)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(236,72,153,0.28), transparent 40%), radial-gradient(circle at top right, rgba(168,85,247,0.22), transparent 35%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      },
    },
  },
  plugins: [],
};
