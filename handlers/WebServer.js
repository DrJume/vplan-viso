const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

const lanIP = require('util/local-ip')

const fs = require('fs')
const WritableStream = require('stream').Writable

const express = require('express')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const morgan = require('morgan')

const routes = require('routes/index')

const { webserverPort } = Config

let server

async function RunWebServer() {
  const app = express()

  // Webserver logging system
  if (!fs.existsSync('logs/')) fs.mkdirSync('logs')
  const LogFileStream = fs.createWriteStream('logs/access.log', { flags: 'a' }) // Appending file-write stream
  app.use(morgan( // log to file
    '[:date[clf]] :remote-addr (:remote-user) "HTTP/:http-version :method :url" :status (:res[content-type])',
    { stream: LogFileStream },
  ))
  const DebugLogStream = new WritableStream({
    write(chunk, encoding, callback) {
      log.debug('WEBSERVER_EVENT', chunk.toString().trim(), true) // true disables data prettification
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
  app.use(favicon('routes/assets/favicon.ico'))

  // Define routes in routes/index.js
  app.use('/', routes)

  // Custom error handling middleware
  app.use((err, req, res, next) => {
    log.err('WEBSERVER_ERR', err)
    next(err)
  })

  // Use the reload middleware when its installed
  const [, reloadDevPackage] = try_(() => require.resolve('reload'), 'info:NOT_USING_DEV_RELOAD')
  if (reloadDevPackage) {
    log.info('USING_DEV_RELOAD')

    const reload = require('reload') /* eslint-disable-line */
    reload(app)
  }

  // Listen on port specified in config.json and LAN IP-adress
  server = app.listen(webserverPort, lanIP, () => {
    log.info('APP_LISTENING', `${lanIP}:${webserverPort}`)
  }).on('error', (err) => { log.err('NETWORK_ERR', err) })
}

function StopWebServer() {
  if (!server) return
  log.debug('WEBSERVER_STOP')
  server.close()
}

module.exports.run = RunWebServer
module.exports.stop = StopWebServer
