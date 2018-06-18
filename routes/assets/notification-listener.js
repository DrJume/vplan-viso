/* eslint-env browser */
/* eslint-disable no-console */
(function main() {
  console.log('NOTIFICATION_LISTENER_START')
  const socketUrl = `ws://${window.location.host}`

  let afterConnectionAbort = false

  const wsInit = () => setTimeout(() => {
    const ws = new WebSocket(socketUrl)

    ws.onopen = () => {
      console.log('WS_OPENED')
      if (afterConnectionAbort) {
        window.location.reload()
      }
    }
    ws.onclose = () => {
      console.log('WS_CLOSED')
      afterConnectionAbort = true
      wsInit()
    }

    ws.onmessage = (msg) => {
      console.log(`WS_MSG: "${msg.data}"`)
      if (msg.data === 'RELOAD_ALL') {
        window.location.reload()
      }
    }
  }, 400)

  window.addEventListener('load', () => {
    console.log('WINDOW_LOADED')
    wsInit()
  })
}())
