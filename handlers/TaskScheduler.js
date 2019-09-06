const cron = require('node-cron')

const Updater = require('services/Updater')
const VPlanParser = require('lib/VPlanParser')

const promiseFs = require('util/promisified').fs

// TODO: check for code quality

async function shiftVPlan(type) {
  // returns false on failure

  // delete current vplan
  let [err] = await try_(promiseFs.unlink(`share/upload/current/${type}.json`), 'silenced:FILE_DELETE_ERR')
  if (err && err.code !== 'ENOENT') {
    log.err('FILE_DELETE_ERR', err)
    return false
  }

  // get next vplan and move it into current if its for current day
  let nextVPlanJSON // eslint-disable-next-line prefer-const
  [err, nextVPlanJSON] = await try_(
    promiseFs.readFile(`share/upload/next/${type}.json`, { encoding: 'utf-8' }),
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

  let nextVPlan // eslint-disable-next-line prefer-const
  [err, nextVPlan] = try_(() => JSON.parse(nextVPlanJSON), 'JSON_PARSE_ERR')
  if (err) return false

  const queueDay = VPlanParser.getQueueDay(nextVPlan)
  if (!queueDay) {
    log.err('UNKNOWN_QUEUEDAY', `share/upload/next/${type}.json`)
    return false
  }
  if (queueDay === 'next') {
    log.info('NOT_SHIFTING_VPLAN')
    return true
  }

  [err] = await try_(
    promiseFs.writeFile(`share/upload/current/${type}.json`, nextVPlanJSON),
    'FILE_WRITE_ERR',
  )
  if (err) return false;

  // delete next vplan
  [err] = await try_(promiseFs.unlink(`share/upload/next/${type}.json`), 'FILE_DELETE_ERR')
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

async function RunVPlanShift() {
  log.info('VPLAN_SHIFT')

  if (!(await shiftVPlan('students'))) log.err('STUDENT_VPLANSHIFT_FAILED')
  if (!(await shiftVPlan('teachers'))) log.err('TEACHER_VPLANSHIFT_FAILED')
}

function StartTaskRunner() {
  // Update service
  cron.schedule('0 23 * * *', async () => {
    await RunUpdate()
  })

  // VPlan day shift on week days
  cron.schedule('0 1 * * Mon-Fri', async () => {
    await RunVPlanShift()
  })
}


module.exports.start = StartTaskRunner
module.exports.RunUpdate = RunUpdate
module.exports.RunVPlanShift = RunVPlanShift
