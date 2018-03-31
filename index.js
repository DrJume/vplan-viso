/* eslint-disable global-require */
(async function main() {
  // Make the project path easier accessible for use in the require() function
  process.env.NODE_PATH = __dirname
  require('module')._initPaths() // Might break in the future

  const logger = require('helpers/logger')
  const readConfig = require('helpers/read-config')

  global.log = logger // Make the logger globally accessible
  global.config = await readConfig('config.json') // Make parsed config.json globally accessible
  global.__basedir = __dirname // Set the project dir as global __basedir


  // Start test-script, process exits after it
  // require('test/test-script')

  // Node run location check, run node in project path
  const path = require('path')

  if (path.relative(process.cwd(), __basedir) !== '') {
    log.err('WRONG_NODE_RUN_LOCATION', `Please run 'node index.js' within: ${__basedir}`)
    process.exit(1)
  }

  log.info('VPLAN-VISO_INIT')

  // Running the handlers
  const VplanReceiver = require('handlers/VplanReceiver')
  const WebServer = require('handlers/WebServer')

  VplanReceiver.run()
  WebServer.run()
}())
