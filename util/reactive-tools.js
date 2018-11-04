/* eslint-disable implicit-arrow-linebreak, no-return-assign */
const ReactiveTools = {
  debounce: (callback, time = 250, interval) =>
    (...args) => clearTimeout(interval, interval = setTimeout(() => callback(...args), time)),
}

module.exports = ReactiveTools
