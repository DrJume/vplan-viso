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

const translator = aktion => Object.assign(
  {},
  ...Object.keys(aktion)
    .map(key => ({
      [KeyDictionary[key]]: aktion[key]._ ? aktion[key]._ : '',
    })),
  {
    changed: Object.keys(aktion)
      .map(key => (aktion[key].$ ? KeyDictionary[key] : ''))
      .filter(val => val), // let all solid values through
  },
)

const Templates = {
  [VplanType.STUDENTS]: {
    head: {
      title: 'vp.kopf.titel._',
      schoolname: 'vp.kopf.schulname._',
      created: 'vp.kopf.datum._',
      changed: {
        classes: ['vp.kopf.kopfinfo.abwesendk._', changed_classes => (changed_classes || '')],
        teachers: ['vp.kopf.kopfinfo.abwesendl._', changed_teachers => (changed_teachers || '')],
      },
      missing: {
        classes: ['vp.kopf.kopfinfo.aenderungk._', missing_classes => (missing_classes || '')],
        teachers: ['vp.kopf.kopfinfo.aenderungl._', missing_teachers => (missing_teachers || '')],
      },
    },
    body: [
      'vp.haupt.aktion',
      (aktionCollection) => {
        if (!aktionCollection) return []
        if (Array.isArray(aktionCollection)) {
          return aktionCollection.map(aktion => translator(aktion))
        }
        return [translator(aktionCollection)]
      },
    ],
    info: ['vp.fuss.fusszeile.fussinfo._', info => (info || '')],
  },

  [VplanType.TEACHERS]: {
    head: {
      title: 'vp.kopf.titel._',
      schoolname: 'vp.kopf.schulname._',
      created: 'vp.kopf.datum._',
      changed: {
        classes: ['vp.kopf.kopfinfo.abwesendk._', changed_classes => (changed_classes || '')],
        teachers: ['vp.kopf.kopfinfo.abwesendl._', changed_teachers => (changed_teachers || '')],
      },
      missing: {
        classes: ['vp.kopf.kopfinfo.aenderungk._', missing_classes => (missing_classes || '')],
        teachers: ['vp.kopf.kopfinfo.aenderungl._', missing_teachers => (missing_teachers || '')],
      },
    },
    body: [
      'vp.haupt.aktion',
      (aktionCollection) => {
        if (!aktionCollection) return []
        if (Array.isArray(aktionCollection)) {
          return aktionCollection.map(aktion => translator(aktion))
        }
        return [translator(aktionCollection)]
      },
    ],
    supervision: [
      'vp.aufsichten.aufsichtzeile',
      (aufsichtzeileCollection) => {
        if (!aufsichtzeileCollection) return []
        if (Array.isArray(aufsichtzeileCollection)) {
          return aufsichtzeileCollection.map(aufsichtzeile => aufsichtzeile.aufsichtinfo._)
        }
        return [aufsichtzeileCollection.aufsichtinfo._]
      },
    ],
    info: ['vp.fuss.fusszeile.fussinfo._', info => (info || '')],
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

    log.info('AUTO_SCHEDULING', `${transformedVplanJSObj.type}: [${queueDateString}]`)
    log.debug('QUEUEDAY_BY_DATE_CALC')

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
