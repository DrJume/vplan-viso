/* eslint-disable no-nested-ternary */
const filterObj = (objToFilter, allowedKeys) =>
  allowedKeys.reduce((obj, keyString) => {
    obj[keyString] =
      keyString.split('.')
        .reduce((filteredObj, key) => (filteredObj ? filteredObj[key] : undefined), objToFilter)
    return obj
  }, {})


const isObject = val =>
  typeof val === 'object' && !Array.isArray(val)

const objFromEntries = inputObj =>
  inputObj.reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})

const recursiveObjPatch = (masterObj, patchObj) =>
  objFromEntries(Object.entries(masterObj)
    .map(([key, val]) =>
      [key, (
        patchObj[key]
          ? (
            isObject(patchObj[key])
              ? recursiveObjPatch(masterObj[key], patchObj[key])
              : patchObj[key]
          )
          : val),
      ]))


module.exports.filterObj = filterObj
module.exports.recursiveObjPatch = recursiveObjPatch
