const filterObj = (objToFilter, allowedKeys) =>
  allowedKeys.reduce((obj, keyString) => {
    obj[keyString] =
      keyString.split('.')
        .reduce((filteredObj, key) => (filteredObj ? filteredObj[key] : undefined), objToFilter)
    return obj
  }, {})


const isObject = val =>
  typeof val === 'object' && !Array.isArray(val)

const deepCountKeys = obj =>
  Object.keys(obj).reduce(
    (count, key) =>
      (isObject(obj[key])
        ? count + deepCountKeys(obj[key])
        : count + 1)
    , 0,
  )


module.exports.filterObj = filterObj
module.exports.deepCountKeys = deepCountKeys
