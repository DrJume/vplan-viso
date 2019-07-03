const promiseFs = require('util/promisified').fs
const FrontendNotifier = require('services/FrontendNotifier')

const fs = require('fs')
const WritableStream = require('stream').Writable

const pkg = require('package.json')

const express = require('express')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const morgan = require('morgan')

const routes = require('routes/index')

let server

async function RunWebServer() {
  const app = express()

  if (Config.webserver.log_file) {
    // Webserver logging system
    if (!fs.existsSync('share/logs/')) fs.mkdirSync('share/logs/')
    const LogFileStream = fs.createWriteStream('logs/webserver.log', { flags: 'a' }) // appending file-write stream

    morgan.token('date', () => {
      const d = new Date()
      return `${d.toDateString()} ${d.toLocaleTimeString()}`
    })

    app.use(morgan( // log to file
      '[:date] :remote-addr (:remote-user) :status :method ":url" (:res[content-type])',
      { stream: LogFileStream },
    ))
  }

  if (Config.webserver.log_debug_tty) {
    const DebugLogStream = new WritableStream({
      write(chunk, encoding, callback) {
        log.debug('WEBSERVER', chunk.toString().trim(), true) // <-- true disables data prettification
        callback()
      },
    })
    app.use(morgan('dev', { stream: DebugLogStream })) // dev styled output to logger as stream (prefixing date, etc.)
  }

  app.engine('html', async (filePath, options, callback) => { // define a simple template engine
    let err, content // eslint-disable-next-line prefer-const
    [err, content] = await try_(
      promiseFs.readFile(filePath, { encoding: 'utf-8' }),
      'FILE_READ_ERR',
    )
    if (err) {
      callback(err)
      return
    }

    const rendered = content
      .toString()
      .replace(/{{PKG_VERSION}}/g, pkg.version)

    callback(null, rendered)
  })
  app.set('view engine', 'html')

  app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()) // parse application/json
  app.use(favicon('routes/assets/favicon.ico'))

  // Define routes in routes/index.js
  app.use('/', routes)

  // Custom error handling middleware
  app.use((err, req, res, next) => {
    log.err('WEBSERVER_ERR', err)
    next(err)
  })

  // Listen on port specified in config.json and LAN IP-adress
  server = app.listen(8080, '0.0.0.0', () => {
    log.info('APP_LISTENING', 'http://0.0.0.0:8080')
  }).on('error', (err) => { log.err('NETWORK_ERR', err) })

  log.info('DISPLAY_AUTO_RELOAD_INIT')
  try_(() => FrontendNotifier.initialize(server), 'WEBSOCKET_SERVER_ERR')
}

function StopWebServer() {
  if (!server) return
  log.debug('WEBSERVER_STOP')
  server.close()
}

module.exports.run = RunWebServer
module.exports.stop = StopWebServer
