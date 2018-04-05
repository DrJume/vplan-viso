const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const lanIP = require('util/local-ip')

const fs = require('fs')
const WritableStream = require('stream').Writable

const express = require('express')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const morgan = require('morgan')

const routes = require('routes/index')

const { webserverPort } = Config

async function RunWebServer() {
  const app = express()

  // Webserver logging system
  if (!fs.existsSync('logs/')) { fs.mkdirSync('logs') }
  const LogFileStream = fs.createWriteStream('logs/access.log', { flags: 'a' }) // Appending file-write stream
  app.use(morgan( // log to file
    '[:date[clf]] :remote-addr (:remote-user) "HTTP/:http-version :method :url" :status (:res[content-type])',
    { stream: LogFileStream },
  ))
  const DebugLogStream = new WritableStream({
    write(chunk, encoding, callback) {
      log.debug('WEBSERVER_EVENT', chunk.toString().trim(), true)
      callback()
    },
  })
  app.use(morgan('dev', { stream: DebugLogStream })) // dev styled output to logger as stream (prefixing date, etc.)

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

    const rendered = content.toString()
    callback(null, rendered)
  })
  app.set('view engine', 'html')

  app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()) // parse application/json
  app.use(favicon('routes/static/favicon.ico'))

  // Define routes in routes/index.js
  app.use('/', routes)

  // Custom error handling middleware
  app.use((err, req, res, next) => {
    log.err('WEBSERVER_ERR', err)
    next(err)
  })

  // Listen on port specified in config.json and LAN IP-adress
  app.listen(webserverPort, lanIP, () => {
    log.info('APP_LISTENING', `${lanIP}:${webserverPort}`)
  })
}

module.exports.run = RunWebServer
