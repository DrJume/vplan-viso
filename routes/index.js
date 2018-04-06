const express = require('express')

const dashboard = require('routes/dashboard')
const api = require('routes/api')

const router = express.Router()

// Define routes
router.use('/dashboard', dashboard)
router.use('/assets', express.static('routes/assets'))
router.use('/assets/fontawesome', express.static('routes/assets/fontawesome-free-5.0.9/svg-with-js'))
router.use('/api', api)

// Root path listener
router.get('/', (req, res) => {
  res.redirect('/dashboard')
})

module.exports = router
