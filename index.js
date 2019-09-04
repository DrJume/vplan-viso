/* eslint-disable global-require */
(async function main() {
  // Node run location check, run node in project path
  const path = require('path')

  if (path.relative(process.cwd(), __dirname) !== '') {
    log.err('WRONG_NODE_RUN_LOCATION', `Please run 'node index.js' within: ${__dirname}`)
    process.exit(1)
  }

  // Make the project path easier accessible for use in the require() function
  process.env.NODE_PATH = __dirname
  require('module')._initPaths() // Might break in the future

  const fs = require('fs')
  // create share/ folder for application working data
  if (!fs.existsSync('share/')) fs.mkdirSync('share')

  const logger = require('helpers/logger')
  const try_ = require('helpers/try-wrapper')
  const readConfig = require('helpers/read-config')

  global.log = logger // Make the logger globally accessible
  global.try_ = try_
  global.Config = await readConfig('share/config.json') // Make parsed config.json globally accessible

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

  const moment = require('moment')
  moment.locale('de')

  // Start test-script, process exits after it
  // require('test/test-script')

  const pkg = require('package.json')
  log.info(`VPLAN-VISO_INIT v${pkg.version}`)

  // Purge old updater container
  const Updater = require('services/Updater')
  await try_(Updater.postUpdate(), 'POST_UPDATE_ERR')

  // Running TaskScheduler
  const TaskScheduler = require('handlers/TaskScheduler')
  TaskScheduler.start()

  // Running the handlers
  const VplanReceiver = require('handlers/VplanReceiver')
  const WebServer = require('handlers/WebServer')

  VplanReceiver.run()
  WebServer.run()
}())
