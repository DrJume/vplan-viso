const express = require('express')

const dashboard = require('routes/dashboard')
const api = require('routes/api')

const router = express.Router()

// Define routes
router.use('/dashboard', dashboard)
router.use('/static', express.static('routes/static'))
router.use('/api', api)

// Root path listener
router.get('/', (req, res) => {
  res.redirect('/dashboard')
})

module.exports = router
