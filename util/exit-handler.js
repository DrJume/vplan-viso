let handlers = []

function addHandler(handler) {
  handlers.push(handler)
}

function exitHandler(code) {
  log.debug('EXIT_HANDLER', code)
  handlers.forEach(handler => handler())
  handlers = []
  process.exit(0)
}

process.on('exit', () => log.info('GRACEFUL_EXIT'))
process.on('SIGINT', exitHandler)
process.on('SIGTERM', exitHandler)
process.on('SIGHUP', exitHandler)
process.on('SIGUSR2', exitHandler) // used by nodemon

module.exports.addHandler = addHandler
