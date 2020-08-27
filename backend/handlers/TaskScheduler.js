const cron = require('node-cron')

const DataManager = require('services/DataManager')
const VPlanParser = require('lib/VPlanParser')

// TODO: check for code quality

async function shiftVPlan(vplanType) {
  // returns false on failure

  // delete current vplan
  let [err] = await try_(DataManager.deleteVPlanFile({ type: vplanType, queue: 'current' }), 'silenced:FILE_DELETE_ERR')
  if (err && err.code !== 'ENOENT') {
    log.err('FILE_DELETE_ERR', err)
    return false
  }

  // get next vplan and move it into current if its for current day
  const nextVPlanJSON = DataManager.getVPlan({ type: vplanType, queue: 'next' })
  if (!nextVPlanJSON) {
    log.info('NO_NEXT_VPLAN', `${vplanType}`)
    return true
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
    DataManager.writeVPlanFile({ type: vplanType, queue: 'current' }, nextVPlanJSON),
    'FILE_WRITE_ERR',
  )
  if (err) return false;

  // delete next vplan
  [err] = await try_(DataManager.deleteVPlanFile({ type: vplanType, queue: 'next' }), 'FILE_DELETE_ERR')
  if (err) return false

  return true
}

async function RunVPlanShift() {
  log.info('VPLAN_SHIFT')

  if (!(await shiftVPlan('students'))) log.err('STUDENT_VPLANSHIFT_FAILED')
  if (!(await shiftVPlan('teachers'))) log.err('TEACHER_VPLANSHIFT_FAILED')
}

function StartTaskRunner() {
  // VPlan day shift on week days
  cron.schedule('0 1 * * Mon-Fri', async () => {
    await RunVPlanShift()
  })
}


module.exports.start = StartTaskRunner
module.exports.RunVPlanShift = RunVPlanShift
