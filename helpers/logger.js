/* eslint-disable no-console, class-methods-use-this */
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
    info: 'green INFO',
    error: 'red ERR',
    warning: 'yellow WARN',
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

function generateLogString(prefix, args) {
  const label = args[0]
  const data = args[1]

  if (args.length <= 1) { // only label
    return chalk`${prefix} {whiteBright.bold (${label})}`
  }

  if (!label) {
    return chalk`${prefix} ${prettyJSON(data)}`
  }
  return chalk`${prefix} {whiteBright.bold (${label})} ${prettyJSON(data)}`
}

class Logger {
  // label, data
  info(...args) {
    const logPrefix = generateLogPrefix('info')

    console.info(generateLogString(logPrefix, args))
  }

  err(...args) {
    const logPrefix = generateLogPrefix('error')

    console.error(generateLogString(logPrefix, args))
  }

  warn(...args) {
    const logPrefix = generateLogPrefix('warning')

    console.warn(generateLogString(logPrefix, args))
  }

  debug(...args) {
    const logPrefix = generateLogPrefix('debug')

    console.info(generateLogString(logPrefix, args))
  }
}

module.exports = new Logger()
