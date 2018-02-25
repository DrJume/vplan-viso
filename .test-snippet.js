// const testobj = {
//   num: 123,
//   str: 'abc ',
//   arr: [1, 2, 3],
//   obj: {
//     test: true,
//   },
//   regex: /[a-z]/,
//   undef: undefined,
//   null: null,
// }

// log.info(testobj)
// log.err(testobj, 'hskjdhfksjdhfkjh')
// log.warn(testobj, 'label')
// log.debug(testobj, 'label')

// const try_ = require('helpers/try-wrapper') // eslint-disable-line import/no-unresolved

// function testSync(...arg) {
//   if (arg.length === 0) {
//     throw new Error('no arg specified')
//   }
//   console.log(JSON.stringify(arg))
//   return `ARGUM: ${arg}`
// }

// let err, data

// [err, data] = try_(testSync)
// log.debug([err, data]);
// [err, data] = try_(testSync, { args: [123, 456] })
// log.debug([err, data])


// process.exit()