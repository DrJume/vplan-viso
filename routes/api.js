const express = require('express')
const path = require('path')

const promiseFs = require('util/promisified').fs

const TaskScheduler = require('handlers/TaskScheduler')

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


async function readVplan(vplanType, queueDay) {
  let [err, rawData] = await try_( // eslint-disable-line prefer-const
    promiseFs.readFile(path.join('share/upload/', queueDay, `${vplanType}.json`), { encoding: 'utf-8' }),
    'silenced:FILE_READ_ERR',
  )
  if (err) {
    if (err.code === 'ENOENT') {
      log.debug('NO_VPLAN_AVAILABLE', `${vplanType}/${queueDay}`)
    } else {
      log.err('FILE_READ_ERR', err)
    }

    return [err, rawData]
  }

  let jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(() => JSON.parse(rawData), 'JSON_PARSE_ERR')

  return [err, jsonData]
}


router.get('/vplan/:type(students|teachers)', async (req, res) => {
  if (!req.query.queue) {
    res.send('No ?queue= specified')
    return
  }
  const { type } = req.params
  const { queue } = req.query

  const [err, vplanData] = await readVplan(type, queue)

  if (err) {
    res.status(404).send(`No Vplan availiable for ${type}?queue=${queue}\nPossible values for queue: current, next`)
    return
  }

  res.json(vplanData)
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
      await TaskScheduler.RunVplanShift()
      break
    }

    default: {
      res.send('No ?type= specified')
    }
  }
})

module.exports = router
