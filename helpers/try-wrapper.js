function isPromise(objToCheck) {
  return Promise.resolve(objToCheck) === objToCheck
}

function isFunction(objToCheck) {
  return objToCheck && {}.toString.call(objToCheck) === '[object Function]'
}

function tryWrapper(
  executionObj,
  logOptionsString = '', // format="(logLvl:)LOG_LABEL"
  { errData } = {},
) {
  const logOptions = logOptionsString.split(':')
  if (logOptions.length < 2) logOptions.unshift('')

  let [logLvl, label] = logOptions // eslint-disable-line prefer-const

  if (!logLvl || !log[logLvl]) logLvl = 'err'

  if (isPromise(executionObj)) {
    return executionObj
      .then(data => [null, data])
      .catch((err) => {
        Object.assign(err, {
          ErrorString: err.toString(),
        })

        if (errData) {
          Object.assign(err, {
            _data: errData,
          })
        }

        log[logLvl](label, err)
        return [err, undefined]
      })
  }

  if (isFunction(executionObj)) {
    try {
      const data = executionObj()
      return [null, data]
    } catch (err) {
      Object.assign(err, {
        ErrorString: err.toString(),
      })

      if (errData) {
        Object.assign(err, {
          _data: errData,
        })
      }

      log[logLvl](label, err)
      return [err, undefined]
    }
  }

  return undefined
}

module.exports = tryWrapper
