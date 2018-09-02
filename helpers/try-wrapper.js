const { filterObj } = require('util/object-tools')

function isPromise(objToCheck) {
  return Promise.resolve(objToCheck) === objToCheck
}

function isFunction(objToCheck) {
  return objToCheck && {}.toString.call(objToCheck) === '[object Function]'
}

function handleError(error, logLvl, labelString, errData) {
  const errorString = error.toString()

  const [label, ...allowedKeys] = labelString.split('#')
  if (allowedKeys.length > 0) {
    log.debug('ALLOWED_ERR_FILTER_KEYS', allowedKeys)
    error = filterObj(error, allowedKeys)
  }

  Object.assign(error, {
    ErrorString: errorString,
  })

  if (errData) {
    Object.assign(error, {
      ErrorData: errData,
    })
  }

  log[logLvl](label, error)

  return error
}

function tryWrapper(
  executionObj,
  logOptionsString = '', // format="(logLvl:)labelString"
  { errData } = {},
) {
  const logOptions = logOptionsString.split(':')
  if (logOptions.length < 2) logOptions.unshift('') // prepend empty logLvl, when no logLvl given

  let [logLvl, labelString] = logOptions // eslint-disable-line prefer-const

  if (!logLvl || !log[logLvl]) logLvl = 'err'

  if (isPromise(executionObj)) {
    return executionObj
      .then(data => [null, data])
      .catch(err => [(handleError(err, logLvl, labelString, errData)), undefined])
  }

  if (isFunction(executionObj)) {
    try {
      const data = executionObj()
      return [null, data]
    } catch (err) {
      return [(handleError(err, logLvl, labelString, errData)), undefined]
    }
  }

  return undefined
}

module.exports = tryWrapper
