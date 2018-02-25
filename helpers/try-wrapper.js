function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

function tryWrapper(executionObj, { args, errDetails } = {}) {
  if (Promise.resolve(executionObj) === executionObj) {
    // executionObj is a Promise
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

        log.err(err)
        return [err, undefined]
      })
  }

  if (isFunction(executionObj)) {
    // executionObj is a normal function
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

      log.err(err)
      return [err, undefined]
    }
  }

  return undefined
}

module.exports = tryWrapper
