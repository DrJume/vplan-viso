/* eslint-disable no-console */
const chalk = require('chalk')
const jsome = require('jsome')

const os = require('os')
const WritableStream = require('stream').Writable

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
 * @param {!string} type Log type.
 * @param {?string} label Labels the log message.
 * @param {object} [data] The data to log: gets prettified.
 * @param {boolean} [printRaw] true: disables the prettification. Needs data.
 */
function generateLogString(type, args) {
  const label = args[0]
  let data = args[1]
  const printRaw = args[2]

  let output = `${generateLogPrefix(type)}`

  if (label) {
    output += chalk` {whiteBright.bold (${label})}`
  }

  if (args.length > 1) { // is data described?
    if (!printRaw) {
      data = prettyJSON(data)
    }

    output += ` ${data}`
  }

  return output
}

const Logger = {
  err(...args) {
    process.stdout.write(generateLogString('error', args) + os.EOL)
  },

  warn(...args) {
    process.stdout.write(generateLogString('warning', args) + os.EOL)
  },

  info(...args) {
    process.stdout.write(generateLogString('info', args) + os.EOL)
  },

  debug(...args) {
    if (global.Config && Config.dev.silence_debug_log) {
      return
    }
    process.stdout.write(generateLogString('debug', args) + os.EOL)
  },

  silenced() {
    // print nothing, used in try-wrapper to silence error logging
  },

  createStream(type, label) {
    return new WritableStream({
      write(chunk, encoding, callback) {
        Logger[type](label, chunk.toString().trim(), true) // <-- true disables data prettification
        callback()
      },
    })
  },
}

module.exports = Logger
