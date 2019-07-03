const cron = require('node-cron')

const Updater = require('services/Updater')
const VplanParser = require('lib/VplanParser')

const promiseFs = require('util/promisified').fs

// TODO: check for code quality

async function shiftVplan(type) {
  // returns false on failure

  // delete current vplan
  let [err] = await try_(promiseFs.unlink(`upload/current/${type}.json`), 'silenced:FILE_DELETE_ERR')
  if (err && err.code !== 'ENOENT') {
    log.err('FILE_DELETE_ERR', err)
    return false
  }

  // get next vplan and move it into current if its for current day
  let nextVplanJSON // eslint-disable-next-line prefer-const
  [err, nextVplanJSON] = await try_(
    promiseFs.readFile(`upload/next/${type}.json`, { encoding: 'utf-8' }),
    'silenced:FILE_READ_ERR',
  )
  if (err) {
    if (err.code === 'ENOENT') {
      log.info('NO_NEXT_VPLAN', `${type}`)
      return true
    }
    log.err('FILE_READ_ERR', err)
    return false
  }

  let nextVplan // eslint-disable-next-line prefer-const
  [err, nextVplan] = try_(() => JSON.parse(nextVplanJSON), 'JSON_PARSE_ERR')
  if (err) return false

  const queueDay = VplanParser.getQueueDay(nextVplan)
  if (!queueDay) {
    log.err('UNKNOWN_QUEUEDAY', `upload/next/${type}.json`)
    return false
  }
  if (queueDay === 'next') {
    log.info('NOT_SHIFTING_VPLAN')
    return true
  }

  [err] = await try_(
    promiseFs.writeFile(`upload/current/${type}.json`, nextVplanJSON),
    'FILE_WRITE_ERR',
  )
  if (err) return false;

  // delete next vplan
  [err] = await try_(promiseFs.unlink(`upload/next/${type}.json`), 'FILE_DELETE_ERR')
  if (err) return false

  return true
}

async function RunUpdate() {
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
}

async function RunVplanShift() {
  log.info('VPLAN_SHIFT')

  if (!(await shiftVplan('students'))) log.err('STUDENT_VPLANSHIFT_FAILED')
  if (!(await shiftVplan('teachers'))) log.err('TEACHER_VPLANSHIFT_FAILED')
}

function StartTaskRunner() {
  // Update service
  cron.schedule('0 23 * * *', async () => {
    await RunUpdate()
  })

  // Vplan day shift on week days
  cron.schedule('0 1 * * Mon-Fri', async () => {
    await RunVplanShift()
  })
}


module.exports.start = StartTaskRunner
module.exports.RunUpdate = RunUpdate
module.exports.RunVplanShift = RunVplanShift
