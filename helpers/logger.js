/* eslint-disable no-console */
const chalk = require('chalk')
const jsome = require('jsome')

jsome.colors = {
  num: 'yellowBright', // stands for numbers
  str: 'cyan', // stands for strings
  bool: 'magentaBright', // stands for booleans
  regex: 'blue', // stands for regular expressions
  undef: 'white', // stands for undefined
  null: 'white', // stands for null
  attr: 'redBright', // objects attributes -> { attr : value }
  quot: 'whiteBright', // strings quotes -> "..."
  punc: 'whiteBright', // commas seperating arrays and objects values -> [ , , , ]
  brack: 'whiteBright', // for both {} and []
}

function generateDatePrefix() {
  const d = new Date()

  const twoDigits = num => (num.toString().length < 2 ? `0${num}` : num)

  const day = twoDigits(d.getDate())
  const month = twoDigits(d.getMonth() + 1)
  const year = d.getFullYear().toString().substr(2)

  const hour = twoDigits(d.getHours())
  const minutes = twoDigits(d.getMinutes())
  const seconds = twoDigits(d.getSeconds())

  return `[${day}.${month}.${year} ${hour}:${minutes}:${seconds}]`
}

function generateLogPrefix(type) {
  const datePrefix = generateDatePrefix()

  const typeLabels = {
    error: 'red ERR',
    warning: 'yellow WARN',
    info: 'green INFO',
    debug: 'blueBright.underline DEBUG',
  }

  if (!typeLabels[type]) {
    return chalk`{dim ${datePrefix}}`
  }

  return chalk`{dim ${datePrefix}} {${typeLabels[type]}}`
}

function prettyJSON(data) {
  if (data === undefined) {
    return undefined
  }
  return jsome.getColoredString(data)
  // return JSON.stringify(data, null, 2) // 2-space indentation, without "replacer"
}

/**
 * @param {!string} prefix Defaults are date and log type.
 * @param {?string} label Labels the log message.
 * @param {object} [data] The data to log: gets prettified.
 * @param {boolean} [printRaw] true: disables the prettification. Needs data.
 */
function generateLogString(prefix, args) {
  const label = args[0]
  let data = args[1]
  const printRaw = args[2]

  if (args.length <= 1) { // only label
    return chalk`${prefix} {whiteBright.bold (${label})}`
  }

  if (!printRaw) {
    data = prettyJSON(data)
  }

  if (!label) {
    return chalk`${prefix} ${data}`
  }
  return chalk`${prefix} {whiteBright.bold (${label})} ${data}`
}

const Logger = {
  err(...args) {
    const logPrefix = generateLogPrefix('error')

    console.log(generateLogString(logPrefix, args))
  },

  warn(...args) {
    const logPrefix = generateLogPrefix('warning')

    console.log(generateLogString(logPrefix, args))
  },

  info(...args) {
    const logPrefix = generateLogPrefix('info')

    console.log(generateLogString(logPrefix, args))
  },

  debug(...args) {
    if (Config.dev.silence_debug_log) {
      return
    }
    const logPrefix = generateLogPrefix('debug')

    console.log(generateLogString(logPrefix, args))
  },

  ignore() { // TODO: better function name: silenced?
    // print nothing, used in try-wrapper to silence error logging
  },
}

module.exports = Logger
