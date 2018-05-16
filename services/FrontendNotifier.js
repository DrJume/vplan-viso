const WebSocket = require('ws')

let wss // WebSocketServer

const FrontendNotifier = {
  initialize(httpServer) {
    log.debug('WEBSOCKET_SERVER_START')
    wss = new WebSocket.Server({ server: httpServer })

    wss.on('connection', (ws, req) => {
      const clientIP = req.connection.remoteAddress
      log.debug('WEBSOCKET_CONNECTION_OPENED', clientIP)
    })
  },

  reloadAll() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('RELOAD_ALL')
      }
    })
  },
}

module.exports = FrontendNotifier
