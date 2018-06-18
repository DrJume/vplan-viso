const try_ = require('helpers/try-wrapper')

const fanci = require('fanci')
const moment = require('moment')

const VplanType = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
}

const KeyDictionary = {
  klasse: 'class',
  stunde: 'lesson',
  fach: 'subject',
  lehrer: 'teacher',
  raum: 'room',
  info: 'info',
  vfach: 'new_subject',
  vlehrer: 'new_teacher',
  vraum: 'new_room',
}

const Templates = {
  [VplanType.STUDENTS]: {
    head: {
      title: 'vp.kopf.titel._',
      schoolname: 'vp.kopf.schulname._',
      created: 'vp.kopf.datum._',
      changed: {
        classes: 'vp.kopf.kopfinfo.abwesendk._',
        teachers: 'vp.kopf.kopfinfo.abwesendl._',
      },
      missing: {
        classes: 'vp.kopf.kopfinfo.aenderungk._',
        teachers: 'vp.kopf.kopfinfo.aenderungl._',
      },
    },
    body: [
      'vp.haupt.aktion.*',
      entries => entries.map(entry => Object.assign(
        {},
        ...Object.keys(entry)
          .map(key => ({
            [KeyDictionary[key]]: entry[key]._ ? entry[key]._ : '',
          })),
        {
          changed: Object.keys(entry)
            .map(key => (entry[key].$ ? KeyDictionary[key] : ''))
            .filter(val => val), // let all solid values through
        },
      )),
    ],
    footer: 'vp.fuss.fusszeile.fussinfo._',
  },

  [VplanType.TEACHERS]: {
    head: {
      title: 'vp.kopf.titel._',
      schoolname: 'vp.kopf.schulname._',
      created: 'vp.kopf.datum._',
      changed: {
        classes: 'vp.kopf.kopfinfo.abwesendk._',
        teachers: 'vp.kopf.kopfinfo.abwesendl._',
      },
      missing: {
        classes: 'vp.kopf.kopfinfo.aenderungk._',
        teachers: 'vp.kopf.kopfinfo.aenderungl._',
      },
    },
    body: [
      'vp.haupt.aktion.*',
      entries => entries.map(entry => Object.assign(
        {},
        ...Object.keys(entry)
          .map(key => ({
            [KeyDictionary[key]]: entry[key]._ ? entry[key]._ : '',
          })),
        {
          changed: Object.keys(entry)
            .map(key => (entry[key].$ ? KeyDictionary[key] : ''))
            .filter(val => val), // let all solid values through
        },
      )),
    ],
    supervision: [
      'vp.aufsichten.aufsichtzeile.*',
      entries => entries.map(entry => entry.aufsichtinfo._),
    ],
    footer: 'vp.fuss.fusszeile.fussinfo._',
  },
}

const VplanParser = {
  detectType(rawVplanJSObject) {
    const rawInstructionStylesheet = rawVplanJSObject._instruction['xml-stylesheet']
      .split('href="')[1]
      .split('"')[0]

    log.debug('RAW_VPLAN_TYPE', rawInstructionStylesheet)

    const isStudents = rawInstructionStylesheet === 'vplank.xsl'
    const isTeachers = rawInstructionStylesheet === 'vplanl.xsl'

    if (isStudents) return VplanType.STUDENTS
    if (isTeachers) return VplanType.TEACHERS
    return undefined
  },

  async transform(rawVplanJSObject) {
    const vplanType = this.detectType(rawVplanJSObject)
    if (!vplanType) return { transformedVplanData: undefined, vplanType: undefined }

    let [, transformedVplanData] = try_(
      () => fanci.transform(rawVplanJSObject, Templates[vplanType]),
      'VPLAN_PARSE_ERR',
    )
    // prepend type attribute
    transformedVplanData = Object.assign({ type: vplanType }, transformedVplanData)

    return { transformedVplanData, vplanType }
  },

  determineQueueDay(transformedVplanJSObj) {
    // get date string from vplan title
    const queueDateString = transformedVplanJSObj.head.title.trim()
    log.debug('VPLAN_TITLE_QUEUEDATE_STRING', queueDateString)
    const queueDate = moment(queueDateString, 'dddd, D. MMMM YYYY')

    // when not parseable date, delete uploaded vplan
    if (!queueDate.isValid()) {
      log.err('TITLE_QUEUEDATE_PARSING_ERR', queueDateString)

      return undefined
    }

    log.info('DETECTING_QUEUEDAY_BY_DATE_CALC')

    const today = moment()
    log.debug('QUEUEDATE', queueDate)
    log.debug('TODAY', today)
    log.debug('IS_AFTER_TODAY', queueDate.isAfter(today))

    const queueDay = queueDate.isAfter(today) ? 'next' : 'current'
    log.debug('QUEUEDAY', queueDay)

    return queueDay
  },
}

module.exports = VplanParser
