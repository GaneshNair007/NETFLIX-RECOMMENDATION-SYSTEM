/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                netflix: {
                    black: '#141414',
                    red: '#E50914',
                    'red-dark': '#b20710',
                    gray: '#808080',
                    'gray-light': '#b3b3b3',
                },
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
