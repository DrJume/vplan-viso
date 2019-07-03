const testobj = {
  num: 123,
  str: 'abc ',
  arr: [1, 2, 3],
  obj: {
    test: true,
  },
  regex: /[a-z]/,
  undef: undefined,
  null: null,
}

log.info('ONLY_LABEL')
log.info('LABEL_WITH_UNDEFINED_DATA', undefined)
log.info('LABEL_WITH_NULL_DATA', null)
log.info('LABEL_WITH_EMPTY_DATA', '')
log.info('LABEL_WITH_DATA', testobj)
log.info('', 'NO_LABEL_THIS_IS_DATA')
log.info('', '')
