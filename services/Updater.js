const axios = require('axios')

const Docker = require('dockerode')

async function checkUpdate() {
  return {
    isLatestNewer: true,
  }
}

async function postUpdate() {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })

  docker.listContainers({ all: true, filters: { label: ['de.drjume.vplan-viso.upgrader'] } }, async (listErr, containers) => {
    if (listErr) {
      log.err('POST_UPDATE_LIST_CONTAINER_ERR', listErr)
      return
    }
    containers.forEach((containerData) => {
      docker.getContainer(containerData.Id).remove((removeErr, data) => {
        if (listErr) {
          log.err('POST_UPDATE_REMOVE_CONTAINER_ERR', removeErr)
          return
        }
        log.debug('POST_UPDATE_REMOVED_CONTAINER_DATA', data)
        log.info('REMOVED_UPDATE_CONTAINER')
      })
    })
  })
}

async function runUpdate() {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })

  docker.pull('containrrr/watchtower:arm64v8-latest', async (pullErr, stream) => {
    if (pullErr) {
      log.err('UPDATE_CONTAINER_PULL', pullErr)
      return
    }
    stream.pipe(log.createStream('debug', 'UPDATE_CONTAINER_PULL'))

    stream.on('close', async () => {
      const [runErr, container] = await try_(docker.run(
        'containrrr/watchtower:arm64v8-latest', ['--cleanup', '--run-once', 'vplan-viso'],
        log.createStream('debug', 'UPDATE_CONTAINER_RUN'),
        { Binds: ['/var/run/docker.sock:/var/run/docker.sock'], Labels: { 'de.drjume.vplan-viso.upgrader': '1' }/* , HostConfig: { AutoRemove: true }  // Cannot be used, times out during update */ },
      ), 'UPDATE_CONTAINER_RUN')
      if (runErr) return

      // log.debug('CONTAINER_STATUS', container.output.StatusCode)
      await container.remove()
      log.debug('UPDATE_CONTAINER_REMOVED')
    })
  })
}

module.exports.checkUpdate = checkUpdate
module.exports.runUpdate = runUpdate
module.exports.postUpdate = postUpdate
