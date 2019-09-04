export default function wsSyncPlugin(store) {

  console.debug({ wsSyncPlugin: 'INIT' })
  // const socketUrl = `ws://${window.location.origin}`
  const socketUrl = 'ws://localhost:8088'
  let connectionDisrupted = false

  const wsInit = () => {
    const ws = new WebSocket(socketUrl)

    ws.onopen = () => {
      console.debug({ wsSyncPlugin: 'CONNECTION_OPENED' })
      if (connectionDisrupted) {
        console.debug({ wsSyncPlugin: 'PAGE_RELOAD' })
        window.location.reload(true)
        return
      }

      ws.send(JSON.stringify({ type: 'JOIN', payload: { target: store.state.display.target } }))
    }
    ws.onclose = () => {
      console.debug({ wsSyncPlugin: 'CONNECTION_CLOSED' })
      connectionDisrupted = true

      setTimeout(() => {
        wsInit()
      }, 2000)
    }

    ws.onmessage = (msg) => {
      try {
        var wsPacket = JSON.parse(msg.data)
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
          store.commit('SET_VPLAN', wsPacket.payload)
          break
        }



        default:
          break
      }
    }
  }
  wsInit()




  // socket.on('data', data => {
  //   store.commit('receiveData', data)
  // })
  // store.subscribe(mutation => {
  //   if (mutation.type === 'UPDATE_DATA') {
  //     socket.emit('update', mutation.payload)
  //   }
  // })
}
