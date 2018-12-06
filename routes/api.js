const express = require('express')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

const TaskScheduler = require('handlers/TaskScheduler')

const router = express.Router()

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

async function readVplan(queueDay, vplanType) {
  let [err, rawData] = await try_( // eslint-disable-line prefer-const
    promiseFs.readFile(path.join('upload', queueDay, `${vplanType}.json`), { encoding: 'utf-8' }),
    'silenced:FILE_READ_ERR',
  )
  if (err) {
    if (err.code === 'ENOENT') {
      log.debug('NO_VPLAN_AVAILABLE', `${queueDay}/${vplanType}`)
    } else {
      log.err('FILE_READ_ERR', err)
    }

    return [err, rawData]
  }

  let jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(() => JSON.parse(rawData), 'JSON_PARSE_ERR')

  return [err, jsonData]
}


router.get('/current|next', async (req, res) => {
  if (!req.query.type) {
    res.send('No ?type= specified')
    return
  }
  const [err, vplanData] = await readVplan(req.path, req.query.type)

  if (err) {
    res.status(404).send(`No Vplan availiable for ${req.path}?type=${req.query.type}\nUsed types: teachers, students`)
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
