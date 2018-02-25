const chalk = require('chalk')
const jsome = require('jsome')

jsome.colors = {
  num: 'yellowBright', // stands for numbers
  str: 'cyan', // stands for strings
  bool: 'magentaBright', // stands for booleans
  regex: 'blue', // stands for regular expressions
  undef: 'gray', // stands for undefined
  null: 'gray', // stands for null
  attr: 'redBright', // objects attributes -> { attr : value }
  quot: 'white', // strings quotes -> "..."
  punc: 'white', // commas seperating arrays and objects values -> [ , , , ]
  brack: 'white', // for both {} and []
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
    debug: 'cyanBright DEBUG',
  }

  if (!typeLabels[type]) {
    return chalk`{dim ${datePrefix}}`
  }

  return chalk`{dim ${datePrefix}} {${typeLabels[type]}}`
}

function prettyJSON(data) {
  return jsome.getColoredString(data)
  // return JSON.stringify(data, null, 2) // 2-space indentation, without "replacer"
}

function generateLogString(prefix, data, label) {
  if (!label) {
    return chalk`${prefix} ${prettyJSON(data)}`
  }
  return chalk`${prefix} {white (${label})} ${prettyJSON(data)}`
}

const Logger = {
  info(data, label) {
    const logPrefix = generateLogPrefix('info')

    console.info(generateLogString(logPrefix, data, label))
  },
  err(data, label) {
    const logPrefix = generateLogPrefix('error')

    console.error(generateLogString(logPrefix, data, label))
  },
  warn(data, label) {
    const logPrefix = generateLogPrefix('warning')

    console.warn(generateLogString(logPrefix, data, label))
  },
  debug(data, label) {
    const logPrefix = generateLogPrefix('debug')

    console.info(generateLogString(logPrefix, data, label))
  },
}

module.exports = Logger
