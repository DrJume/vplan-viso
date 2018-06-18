const cron = require('node-cron')

const Updater = require('services/Updater')
const VplanParser = require('services/VplanParser')

const promiseFs = require('util/promisified').fs
const try_ = require('helpers/try-wrapper')

function StartTaskRunner() {
  // Update service
  cron.schedule('0 2 * * *', async () => {
    log.info('CHECKING_FOR_UPDATE')

    const update = await Updater.checkUpdate()
    if (!update) {
      log.err('UPDATE_CHECK_FAILED')
      return
    }

    log.debug('UPDATE_INFO', update)

    if (!update.isLatestNewer) {
      log.info('NO_UPDATE_NEEDED')
      return
    }

    await Updater.runUpdate(update)
  })

  // Vplan day shift on week days
  cron.schedule('0 3 * * Mon-Fri', async () => {
    log.info('VPLAN_DAY_SHIFT')

    // delete current vplan
    let err
    [err] = await try_(promiseFs.unlink('upload/current/students.json'), 'FILE_DELETE_ERR')
    if (err) return

    // get next vplan and move it into current if its for next day
    let nextVplanData // eslint-disable-next-line prefer-const
    [err, nextVplanData] = await try_(
      promiseFs.readFile('upload/next/students.json', { encoding: 'utf-8' }),
      'FILE_READ_ERR',
    )
    if (err) return

    let nextVplanJSObj // eslint-disable-next-line prefer-const
    [err, nextVplanJSObj] = try_(() => JSON.parse(nextVplanData), 'JSON_PARSE_ERR')
    if (err) return

    const queueDay = VplanParser.determineQueueDay(nextVplanJSObj)
    if (!queueDay) {
      log.err('UNKNOWN_QUEUEDAY', 'upload/next/students.json')
      log.err('VPLAN_SHIFT_ERR')
      return
    }
    if (queueDay !== 'current') {
      log.info('VPLAN_STILL_FOR_NEXT')
      log.info('NOT_SHIFTING_VPLAN')
      return
    }

    [err] = await try_(
      promiseFs.writeFile('upload/current/students.json', nextVplanData),
      'FILE_WRITE_ERR',
    )
    if (err) return

    // delete next vplan
    [err] = await try_(promiseFs.unlink('upload/next/students.json'), 'FILE_DELETE_ERR')
    if (err) return

    log.info('VPLAN_SHIFT_SUCCESS')
  })
}

module.exports.start = StartTaskRunner
