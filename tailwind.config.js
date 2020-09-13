module.exports = {
  purge: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        blue: "#114D93",
        lightgrey: "#F1F1F1",
        grey: "#505050",
        darkgrey: "#363636",
        teal: "#2eb09f",
        red: "#fe230a"
      },
      fontFamily: {
        text: ["Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        title: ["trade-gothic-next", '"Century Gothic"', "sans-serif"],
      },
    },
  },
  variants: {},
  plugins: [],
}
