function isPromise(objToCheck) {
  return Promise.resolve(objToCheck) === objToCheck
}

function isFunction(objToCheck) {
  return objToCheck && {}.toString.call(objToCheck) === '[object Function]'
}

function tryWrapper(executionObj, {
  args, logLvl = 'err', logLabel, errDetails,
} = {}) {
  if (!log[logLvl]) {
    logLvl = 'err'
  }

  if (isPromise(executionObj)) {
    return executionObj
      .then(data => [null, data])
      .catch((err) => {
        Object.assign(err, {
          Error: err.toString(),
        })

        if (errDetails) {
          Object.assign(err, {
            _details: errDetails,
          })
        }

        log[logLvl](err, logLabel)
        return [err, undefined]
      })
  }

  if (isFunction(executionObj)) {
    try {
      if (!args) {
        const data = executionObj()
        return [null, data]
      }

      const data = executionObj(...args)
      return [null, data]
    } catch (err) {
      Object.assign(err, {
        Error: err.toString(),
      })

      if (errDetails) {
        Object.assign(err, {
          _details: errDetails,
        })
      }

      log[logLvl](err, logLabel)
      return [err, undefined]
    }
  }

  return undefined
}

module.exports = tryWrapper
