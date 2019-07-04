const axios = require('axios')
const tar = require('tar')

const os = require('os')
const path = require('path')

const { fs: promiseFs, time: { delay } } = require('util/promisified')
const { exec } = require('util/promisified').child_process

const WebServer = require('handlers/WebServer')
const Docker = require('dockerode')

async function checkUpdate() {
  return {
    isLatestNewer: true,
  }
}

async function runUpdate() {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })

  docker.pull('containrrr/watchtower:latest', async (err, stream) => {
    if (err) {
      log.err('CONTAINER_PULL_ERR', err)
      return
    }
    stream.pipe(log.createStream('debug', 'CONTAINER_PULL'))

    stream.on('close', async () => {
      const [err, container] = await try_(docker.run(
        'containrrr/watchtower', ['--run-once', 'drjume/vplan-viso'],
        log.createStream('debug', 'CONTAINER_RUN'),
        { Binds: ['/var/run/docker.sock:/var/run/docker.sock'] },
      ), 'CONTAINER_RUN_ERR')

      log.debug('CONTAINER_STATUS', container.output.StatusCode)
      await container.remove()

      log.debug('', 'container removed')
    })
  })
}

module.exports.checkUpdate = checkUpdate
module.exports.runUpdate = runUpdate
