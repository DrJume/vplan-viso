const WebSocket = require('ws')

// const { debounce } = require('util/reactive-tools')
const DataManager = require('services/DataManager')

let wsServer // WebSocketServer

// const debouncedReloadAll = debounce(() => {
//   log.debug('DISPLAYS_REFRESHED')
//   wsServer.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send('RELOAD_ALL')
//     }
//   })
// }, 3000)

/* const getMockVPlan = (length = 20, subject = 'FR') => {
  const mockData = {
    type: 'students',
    head: [],
    body: [],
    info: [],
  }

  for (let i = 1; i <= length; i++) {
    mockData.body.push({
      id: i,
      data: {
        class: '6a',
        lesson: i,
        subject,
        teacher: 'Nen',
        room: '116',
        info: `Für FR Sch ${i === 20 ? 'jdhlgkajdfhlgkjhdfldsldkfjghsldkfjghl' : ''}`,
      },
    })
  }

  return mockData
} */

/* ws.send(JSON.stringify({ type: 'TICKER', payload: 'Lorem ipsum dolor sit amet.' }))
ws.send(JSON.stringify({ type: 'VPLAN', payload: { vplan: getMockVPlan(25, 'CH'), queue: 'current' } }))
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
                const [readErr, vplanJSON] = await try_(DataManager.readVPlan({ type: wsPacket.payload.target, queue }), 'READ_VPLAN_ERR')
                if (readErr) return

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
