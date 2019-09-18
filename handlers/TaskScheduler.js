const cron = require('node-cron')

const Updater = require('services/Updater')
const DataManager = require('services/DataManager')
const VPlanParser = require('lib/VPlanParser')

// TODO: check for code quality

async function shiftVPlan(vplanType) {
  // returns false on failure

  // delete current vplan
  let [err] = await try_(DataManager.deleteVPlan({ type: vplanType, queue: 'current' }), 'silenced:FILE_DELETE_ERR')
  if (err && err.code !== 'ENOENT') {
    log.err('FILE_DELETE_ERR', err)
    return false
  }

  // get next vplan and move it into current if its for current day
  let nextVPlanJSON // eslint-disable-next-line prefer-const
  [err, nextVPlanJSON] = await try_(
    DataManager.readVPlan({ type: vplanType, queue: 'next' }),
    'silenced:FILE_READ_ERR',
  )
  if (err) {
    if (err.code === 'ENOENT') {
      log.info('NO_NEXT_VPLAN', `${vplanType}`)
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
    log.err('UNKNOWN_QUEUEDAY', DataManager.Paths.vplan({ type: vplanType, queue: 'next' }))
    return false
  }
  if (queueDay === 'next') {
    log.info('NOT_SHIFTING_VPLAN')
    return true
  }

  [err] = await try_(
    DataManager.writeVPlan({ type: vplanType, queue: 'current' }, nextVPlanJSON),
    'FILE_WRITE_ERR',
  )
  if (err) return false;

  // delete next vplan
  [err] = await try_(DataManager.deleteVPlan({ type: vplanType, queue: 'next' }), 'FILE_DELETE_ERR')
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
