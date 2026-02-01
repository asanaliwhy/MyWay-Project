/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./pages/**/*.{tsx,ts}",
        "./components/**/*.{tsx,ts}",
        "./features/**/*.{tsx,ts}",
        "./*.tsx",
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [],
}