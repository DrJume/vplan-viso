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


// const try_ = require('helpers/try-wrapper')

// function testSync(...arg) {
//   if (arg.length === 0) {
//     throw new Error('no arg specified')
//   }
//   console.log(JSON.stringify(arg))
//   return `ARGUM: ${arg}`
// }

// let err, data

// [err, data] = try_(testSync)
// log.debug('', [err, data]);
// [err, data] = try_(testSync, { args: [123, 456] })
// log.debug('', [err, data])

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

// log.info('ONLY_LABEL')
// log.info('LABEL_WITH_UNDEFINED_DATA', undefined)
// log.info('LABEL_WITH_NULL_DATA', null)
// log.info('LABEL_WITH_EMPTY_DATA', '')
// log.info('LABEL_WITH_DATA', testobj)
// log.info('', 'NO_LABEL_THIS_IS_DATA')

// log.debug('NO_LABEL_UNDEFINED_DATA')
// log.info('', undefined)
// log.debug('NO_LABEL_NULL_DATA')
// log.info('', null)
// log.debug('NO_LABEL_EMPTY_DATA')
// log.info('', '')
// log.debug('NO_LABEL_DATA')
// log.info('', testobj)
