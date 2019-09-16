const WebSocketSync = require('services/WebSocketSync')

const fs = require('fs')

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const backend = require('backend/index')

let server

async function RunWebServer() {
  const app = express()

  if (Config.webserver.log_file) {
    // Webserver logging system
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
    app.use(morgan('dev', { stream: log.createStream('debug', 'WEBSERVER') })) // dev styled output to logger as stream (prefixing date, etc.)
  }

  app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()) // parse application/json

  // Defined routes of backend/
  app.use('/', backend)

  // Custom error handling middleware
  app.use((err, req, res, next) => {
    log.err('WEBSERVER_ERR', err)
    // next(err)
    res.status(500).send(err.toString())
  })

  // Default port is 8000, because of internal Docker container port mapping
  server = app.listen(8000, '0.0.0.0', () => {
    log.info('APP_LISTENING', 'http://0.0.0.0:8000')
  }).on('error', (err) => { log.err('NETWORK_ERR', err) })

  log.info('DISPLAY_AUTO_RELOAD_INIT')
  try_(() => WebSocketSync.initialize(server), 'WEBSOCKET_SERVER_ERR')
}

function StopWebServer() {
  if (!server) return
  log.debug('WEBSERVER_STOP')
  server.close()
}

module.exports.run = RunWebServer
module.exports.stop = StopWebServer
