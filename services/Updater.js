const axios = require('axios')

const Docker = require('dockerode')

async function checkUpdate() {
  return {
    isLatestNewer: true,
  }
}

async function runUpdate() {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })

  docker.pull('containrrr/watchtower:latest', async (pullErr, stream) => {
    if (pullErr) {
      log.err('UPDATE_CONTAINER_PULL', pullErr)
      return
    }
    stream.pipe(log.createStream('debug', 'UPDATE_CONTAINER_PULL'))

    stream.on('close', async () => {
      const [runErr, container] = await try_(docker.run(
        'containrrr/watchtower', ['--run-once', 'vplan-viso'],
        log.createStream('debug', 'UPDATE_CONTAINER_RUN'),
        { Binds: ['/var/run/docker.sock:/var/run/docker.sock'] },
      ), 'UPDATE_CONTAINER_RUN')
      // if (runErr) return

      // log.debug('CONTAINER_STATUS', container.output.StatusCode)
      // await container.remove()
      // log.debug('UPDATE_CONTAINER_REMOVED')
    })
  })
}

module.exports.checkUpdate = checkUpdate
module.exports.runUpdate = runUpdate
