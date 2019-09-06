const WebSocket = require('ws')

// const { debounce } = require('util/reactive-tools')

let wsServer // WebSocketServer

// const debouncedReloadAll = debounce(() => {
//   log.debug('DISPLAYS_REFRESHED')
//   wsServer.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send('RELOAD_ALL')
//     }
//   })
// }, 3000)

const WebSocketSync = {
  initialize(httpServer) {
    log.debug('WEBSOCKET_SERVER_START')
    wsServer = new WebSocket.Server({ server: httpServer })

    const getMockVPlan = (length = 20, subject = 'FR') => {
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
    }


    wsServer.on('connection', (ws, req) => {
      // log.debug('WEBSOCKET_CONNECTION_HEADERS', req.headers)
      const clientIP = req.connection.remoteAddress
      log.debug('WEBSOCKET_CONNECTION_OPENED', clientIP)

      ws.on('message', (msg) => {
        const [err, wsPacket] = try_(() => JSON.parse(msg), 'WEBSOCKET_PACKET_MALFORMED', { msg, clientIP })
        if (err) return

        log.debug('WEBSOCKET_PACKET', { packet: wsPacket, clientIP })

        switch (wsPacket.type) {
          case 'JOIN': {
            ws.send(JSON.stringify({ type: 'TICKER', payload: 'Lorem ipsum dolor sit amet.' }))
            ws.send(JSON.stringify({ type: 'VPLAN', payload: { vplan: getMockVPlan(25, 'CH'), queue: 'current' } }))

            // setTimeout(() => {
            //   ws.send(JSON.stringify(
            //     { type: 'VPLAN', payload: { vplan: getMockVPlan(25, 'CH'), queue: 'current' } },
            //   ))
            // }, 7000)
            break
          }


          default:
            break
        }
      })
      ws.on('close', (code, reason) => {
        log.debug('WEBSOCKET_CONNECTION_CLOSED', { clientIP, code, reason })
      })
      ws.on('error', (error) => {
        log.err('WEBSOCKET_CONNECTION_ERROR', error)
      })
    })
  },
}

module.exports = WebSocketSync
