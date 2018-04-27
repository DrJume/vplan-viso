const cron = require('node-cron')

const Updater = require('services/Updater')
const try_ = require('helpers/try-wrapper')

cron.schedule('0 2 * * *', async () => {
  log.warn('CHECKING_FOR_UPDATES')

  let err, update /* eslint-disable-next-line prefer-const */
  [err, update] = await try_(Updater.checkForUpdates(), 'UPDATE_CHECK_FAILED')
  if (err) return

  if (!update.isAvailable) return

  await Updater.runUpdate()
})
