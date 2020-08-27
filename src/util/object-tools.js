/* eslint-disable no-nested-ternary, implicit-arrow-linebreak */
const filterObj = (objToFilter, allowedKeys) =>
  allowedKeys.reduce((obj, keyString) => {
    obj[keyString] = keyString
      .split('.')
      .reduce(
        (filteredObj, key) => (filteredObj ? filteredObj[key] : undefined),
        objToFilter,
      )
    return obj
  }, {})


const isObject = val =>
  val !== null && typeof val === 'object' && !Array.isArray(val)

const objFromEntries = objEntriesArray =>
  objEntriesArray.reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})

const recursiveObjPatch = (masterObj, patchObj) =>
  objFromEntries(Object.entries(masterObj)
    .map(([key, val]) =>
      [key, (
        ((patchObj[key] != null) && patchObj[key] !== masterObj[key])
          ? (
            isObject(patchObj[key])
              ? recursiveObjPatch(masterObj[key], patchObj[key])
              : patchObj[key]
          )
          : val),
      ]))

const deepObjectVal = { // manipulate nested object value
  set({ obj, keys, val }) {
    const lastKey = keys.pop()
    const ref = keys.reduce((acc, key) => acc[key], obj)
    ref[lastKey] = val
  },
  get({ obj, keys }) {
    return keys.reduce((acc, key) => acc[key], obj)
  },
}

module.exports.isObject = isObject
module.exports.filterObj = filterObj
module.exports.recursiveObjPatch = recursiveObjPatch
module.exports.deepObjectVal = deepObjectVal
