const WebSocket = require('ws')

const { debounce } = require('util/reactive-tools')

let wss // WebSocketServer

const debouncedReloadAll = debounce(() => {
  log.debug('DISPLAYS_REFRESHED')
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('RELOAD_ALL')
    }
  })
}, 3000)

const FrontendNotifier = {
  initialize(httpServer) {
    log.debug('WEBSOCKET_SERVER_START')
    wss = new WebSocket.Server({ server: httpServer })

    wss.on('connection', (ws, req) => {
      // log.debug('WEBSOCKET_CONNECTION_HEADERS', req.headers)
      const clientIP = req.connection.remoteAddress
      log.debug('WEBSOCKET_CONNECTION_OPENED', clientIP)
    })
  },

  reloadAll() {
    debouncedReloadAll()
  },
}

module.exports = FrontendNotifier
