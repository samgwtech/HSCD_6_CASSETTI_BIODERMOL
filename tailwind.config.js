/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
     "./pages/**/*.{js,ts,jsx,tsx}",
     "./components/**/*.{js,ts,jsx,tsx}"
   ],
   theme: {
     extend: {
      colors: {
        background: "#000000", // black
        text: "#FFFFFF",       // white
        primary: "text-blue-400",    // violet (or choose another violet hex)
      },
     },
   },
   plugins: [],
 }
 