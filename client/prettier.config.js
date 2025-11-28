/** @type {import('prettier') & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/index.css',
  // "tailwindStylesheet": "./src/index.css"
};
