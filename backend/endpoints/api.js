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

router.get('/vplan/:type(students|teachers)', async (req, res) => {
  if (!req.query.queue) {
    res.send('No ?queue= specified')
    return
  }
  const { type } = req.params
  const { queue } = req.query

  const vplan = DataManager.getVPlan({ type, queue })

  if (!vplan) {
    res.status(404).send(`No VPlan availiable for ${type}?queue=${queue}\nPossible values for queue: current, next`)
    return
  }

  res.set('Content-Type', 'application/json')
  res.send(vplan)
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
