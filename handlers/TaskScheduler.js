const cron = require('node-cron')

const Updater = require('services/Updater')

function StartTaskRunner() {
  // Update service
  cron.schedule('0 2 * * *', async () => {
    log.info('CHECKING_FOR_UPDATE')

    const update = await Updater.getUpdate()
    if (!update) {
      log.err('UPDATE_CHECK_FAILED')
      return
    }

    log.debug('UPDATE_INFO', update)

    if (!update.isLatestNewer) {
      log.info('NO_UPDATE_NEEDED')
      return
    }

    await Updater.installUpdate(update)
  }, 3000)
}

module.exports.start = StartTaskRunner
