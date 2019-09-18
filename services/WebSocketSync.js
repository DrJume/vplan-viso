const WebSocket = require('ws')

const DataManager = require('services/DataManager')

let wsServer // WebSocketServer

/* ws.send(JSON.stringify({ type: 'TICKER', payload: 'Lorem ipsum dolor sit amet.' }))
 */

let connectedClients = []

const WebSocketSync = {
  initialize(httpServer) {
    log.debug('WEBSOCKET_SERVER_START')
    wsServer = new WebSocket.Server({ server: httpServer })

    wsServer.on('connection', (ws, req) => {
      // log.debug('WEBSOCKET_CONNECTION_HEADERS', req.headers)
      const clientIP = req.connection.remoteAddress
      log.debug('WEBSOCKET_CONNECTION_OPENED', clientIP)

      ws.on('message', async (msg) => {
        const [parseErr, wsPacket] = try_(() => JSON.parse(msg), 'WEBSOCKET_PACKET_MALFORMED', { msg, clientIP })
        if (parseErr) return

        log.debug('WEBSOCKET_PACKET', { packet: wsPacket, clientIP })

        if (!wsPacket.type || !wsPacket.payload) {
          log.err('INVALID_WEBSOCKET_PACKET', wsPacket)
          return
        }

        switch (wsPacket.type) {
          case 'JOIN': {
            if (!wsPacket.payload.target) {
              log.err('INVALID_WEBSOCKET_PACKET', wsPacket)
              return
            }
            connectedClients.push({
              ip: clientIP,
              target: wsPacket.payload.target,
              socket: ws,
            })

            log.debug('AVAILABLE_VPLANS', DataManager.getAvailableVPlans())
            Object.entries(DataManager.getAvailableVPlans())
              .find(([target]) => target === wsPacket.payload.target)[1]
              .forEach(async queue => {
                const vplanJSON = DataManager.getVPlan({ type: wsPacket.payload.target, queue })
                if (!vplanJSON) return

                ws.send(JSON.stringify({
                  type: 'VPLAN',
                  payload: { vplan: vplanJSON, queue },
                }))
              })

            break
          }

          default: {
            log.err('UNKNOWN_WEBSOCKET_PACKET_TYPE', wsPacket)
            break
          }
        }
      })
      ws.on('close', (code, reason) => {
        log.debug('WEBSOCKET_CONNECTION_CLOSED', { clientIP, code, reason })
        connectedClients = connectedClients.filter(({ ip }) => ip !== clientIP)
      })
      ws.on('error', (error) => {
        log.err('WEBSOCKET_CONNECTION_ERROR', error)
        connectedClients = connectedClients.filter(({ ip }) => ip !== clientIP)
      })
    })
  },
  syncVplan({ displayTarget, vplanJSON, queue }) {
    connectedClients
      .filter(({ target }) => target === displayTarget)
      .forEach(({ socket }) => {
        socket.send(JSON.stringify({ type: 'VPLAN', payload: { vplan: vplanJSON, queue } }))
      })
  },
}

module.exports = WebSocketSync
