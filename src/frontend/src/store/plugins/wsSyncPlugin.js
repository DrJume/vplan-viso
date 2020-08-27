let wsConnect

export default {
  connect(target) {
    wsConnect(target)
  },
  inject(store) {
    console.debug({ wsSyncPlugin: 'INIT' })
    let connectionDisrupted = false

    wsConnect = (target) => {
      console.debug({ wsSyncPlugin: 'CONNECT', target })

      const socketUrl = `ws://${window.location.host}`
      const ws = new WebSocket(socketUrl)

      ws.onopen = () => {
        console.debug({ wsSyncPlugin: 'CONNECTION_OPENED' })
        if (connectionDisrupted) {
          console.debug({ wsSyncPlugin: 'PAGE_RELOAD' })
          window.location.reload(true)
          return
        }

        ws.send(JSON.stringify({ type: 'JOIN', payload: { target } }))
      }
      ws.onclose = () => {
        console.debug({ wsSyncPlugin: 'CONNECTION_CLOSED' })
        connectionDisrupted = true

        setTimeout(() => {
          wsConnect(target)
        }, 2000)
      }

      ws.onmessage = (msg) => {
        let wsPacket

        try {
          wsPacket = JSON.parse(msg.data)
        } catch {
          console.error({ wsSyncPlugin: 'PACKET_MALFORMED', data: msg.data })
          return
        }

        console.debug({ wsSyncPlugin: 'PACKET_RECEIVED', ...wsPacket })

        switch (wsPacket.type) {
          case 'TICKER': {
            store.commit('SET_TICKER', wsPacket.payload)
            break
          }
          case 'VPLAN': {
            store.dispatch('setVPlan', {
              vplan: JSON.parse(wsPacket.payload.vplan),
              queue: wsPacket.payload.queue,
            })
            break
          }

          default:
            break
        }
      }
    }
  },
}
