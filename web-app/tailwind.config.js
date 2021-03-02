module.exports = {
  purge: ['./src/**/*.html', './src/**/*.tsx'],
  theme: {
    fontFamily: {
      sans: ['Montserrat'],
    },
    extend: {
      colors: {
        brand: '#FF9700',
        'brand-light': '#FFC847',
        'background-gray': '#F7F6F6',
        'lighter-gray': '#e7e7e7',
        'darker-gray': '#c0c0c0',
        'darkest-gray': '#909090',
        negative: '#F44336',
        'negative-light': '#ff7961',
        'negative-dark': '#ba000d',
        positive: '#629c44',
        'positive-light': '#92cd72',
        'positive-dark': '#326d17',
      },
    },
  },
  variants: {},
  plugins: [],
};
