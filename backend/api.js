const express = require('express')

const TaskScheduler = require('handlers/TaskScheduler')

const DataManager = require('services/DataManager')

const router = express.Router()

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

const auth = require('basic-auth')

function check(name, pass) {
  let valid = false

  valid = name === Config.auth.user && pass === Config.auth.password

  return valid
}


router.use('/action', (req, res, next) => {
  const credentials = auth(req)

  setTimeout(() => {
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="Anmeldung:"')
      res.end('')
    } else {
      next()
    }
  }, 1000)
})


async function readVPlan(vplanType, queueDay) {
  let [err, vplanJSON] = await try_( // eslint-disable-line prefer-const
    DataManager.readVPlan({ type: vplanType, queue: queueDay }),
    'silenced:FILE_READ_ERR',
  )
  if (err) {
    if (err.code === 'ENOENT') {
      log.debug('NO_VPLAN_AVAILABLE', `${vplanType}/${queueDay}`)
    } else {
      log.err('FILE_READ_ERR', err)
    }

    return [err, vplanJSON]
  }

  let vplanData // eslint-disable-next-line prefer-const
  [err, vplanData] = await try_(() => JSON.parse(vplanJSON), 'JSON_PARSE_ERR')

  return [err, vplanData]
}


router.get('/vplan/:type(students|teachers)', async (req, res) => {
  if (!req.query.queue) {
    res.send('No ?queue= specified')
    return
  }
  const { type } = req.params
  const { queue } = req.query

  const [err, vplan] = await readVPlan(type, queue)

  if (err) {
    res.status(404).send(`No VPlan availiable for ${type}?queue=${queue}\nPossible values for queue: current, next`)
    return
  }

  res.json(vplan)
})

router.get('/action', async (req, res) => { // TODO: Check code quality
  switch (req.query.type) {
    case 'update': {
      res.redirect('/')
      await TaskScheduler.RunUpdate()
      break
    }

    case 'vplan-shift': {
      res.redirect('/')
      await TaskScheduler.RunVPlanShift()
      break
    }

    default: {
      res.send('No ?type= specified')
    }
  }
})

module.exports = router
