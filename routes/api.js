const express = require('express')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const router = express.Router()

/* // middleware that is specific to this router
router.use((req, res, next) => {
  // log.info('Time: ', Date.now())
  next()
}) */

async function readVplan(queueDay, vplanType) {
  let [err, rawJsonData] = await try_( // eslint-disable-line prefer-const
    promiseFs.readFile(path.join('upload', queueDay, `${vplanType}.json`), { encoding: 'utf-8' }),
    'FILE_READ_ERR',
  )
  if (err) return [err, rawJsonData]

  let jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(() => JSON.parse(rawJsonData), 'JSON_PARSE_ERR')

  return [err, jsonData]
}


router.get('/current|next', async (req, res) => {
  if (!req.query.type) {
    res.send('No ?type= specified')
    return
  }
  const [err, vplanData] = await readVplan(req.path, req.query.type)

  if (err) {
    res.send(`No Vplan availiable for ${req.path}?type=${req.query.type}\nUsed types: teachers, students`)
    return
  }

  res.json(vplanData)
})

module.exports = router
