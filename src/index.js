/* eslint-disable global-require */
(async function main() {
  // Make the project path easier accessible for use in the require() function
  process.env.NODE_PATH = __dirname
  require('module')._initPaths() // Might break in the future

  const logger = require('helpers/logger')
  const try_ = require('helpers/try-wrapper')
  global.log = logger // Make the logger globally accessible
  global.try_ = try_

  // Catches unhandled promise errors and uncought exceptions and logs them
  process.on('unhandledRejection', (error) => {
    Object.assign(error, {
      ErrorString: error.toString(),
      ErrorStack: error.stack,
    })

    log.err('UNHANDLED_REJECTION', error)
  })
  process.on('uncaughtException', (error) => {
    if (error.code === 'EADDRINUSE') return // non perfect fix for server listener failing error catching

    Object.assign(error, {
      ErrorString: error.toString(),
      ErrorStack: error.stack,
    })

    log.err('UNCAUGHT_EXCEPTION', error)
  })

  // Node run location check, run node in project path
  const path = require('path')

  if (path.relative(process.cwd(), `${__dirname}/..`) !== '') {
    log.err('WRONG_NODE_RUN_LOCATION', `Please run 'node index.js' within: ${path.normalize(`${__dirname}/..`)}`)
    process.exit(1)
  }

  const DataManager = require('services/DataManager')
  await DataManager.init()

  const readConfig = require('helpers/config-controller')
  // Make parsed config.json globally accessible
  global.Config = await readConfig('share/config.json')

  const moment = require('moment')
  moment.locale('de')

  const pkg = require('package.json')
  log.info(`VPLAN-VISO_INIT v${pkg.version}`)

  // Running TaskScheduler
  const TaskScheduler = require('handlers/TaskScheduler')
  TaskScheduler.start()

  // Running the handlers
  const DataReceiver = require('handlers/DataReceiver')
  const WebServer = require('handlers/WebServer')

  DataReceiver.run()
  WebServer.run()
}())
