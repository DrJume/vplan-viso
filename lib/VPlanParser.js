const fanci = require('fanci')
const moment = require('moment')

const VPlanType = {
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

const aktionCollMapper = (aktion, index) => Object.assign(
  {},
  { _id: index },

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
  get [VPlanType.STUDENTS]() {
    return {
      head: {
        title: 'vp.kopf.titel._',
        schoolname: 'vp.kopf.schulname._',
        created: 'vp.kopf.datum._',
        changed: {
          classes: ['vp.kopf.kopfinfo.aenderungk._', changed_classes => (changed_classes || '')],
          teachers: ['vp.kopf.kopfinfo.aenderungl._', changed_teachers => (changed_teachers || '')],
        },
        missing: {
          classes: ['vp.kopf.kopfinfo.abwesendk._', missing_classes => (missing_classes || '')],
          teachers: ['vp.kopf.kopfinfo.abwesendl._', missing_teachers => (missing_teachers || '')],
        },
      },
      body: ['vp.haupt.aktion', (aktionCollection) => {
        if (!aktionCollection) return []
        if (Array.isArray(aktionCollection)) {
          return aktionCollection.map((aktion, index) => aktionCollMapper(aktion, index))
        }
        return [aktionCollMapper(aktionCollection, 0)]
      }],
      info: ['vp.fuss.fusszeile', (fussZeile) => {
        if (!fussZeile) return []
        if (Array.isArray(fussZeile)) {
          return fussZeile.map(zeile => zeile.fussinfo._).join('\n')
        }
        return [fussZeile.fussinfo._]
      }],
    }
  },

  get [VPlanType.TEACHERS]() {
    return {
      ...this[VPlanType.STUDENTS],
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
    }
  },
}

const VPlanParser = {
  getType(rawVPlan) {
    const rawStylesheetInstruction = rawVPlan._instruction['xml-stylesheet']
      .split('href="')[1]
      .split('"')[0]

    // log.debug('RAW_STYLESHEET_INSTRUCTION', rawVPlan._instruction['xml-stylesheet'])
    log.debug('RAW_VPLAN_TYPE', rawStylesheetInstruction)

    const isStudents = rawStylesheetInstruction === 'vplank.xsl'
    const isTeachers = rawStylesheetInstruction === 'vplanl.xsl'

    if (isStudents) return VPlanType.STUDENTS
    if (isTeachers) return VPlanType.TEACHERS
    return undefined
  },

  async parse(rawVPlan) {
    const vplanType = this.getType(rawVPlan)
    if (!vplanType) return undefined

    let [err, vplan] = try_( // eslint-disable-line prefer-const
      () => fanci.transform(rawVPlan, Templates[vplanType]),
      'VPLAN_PARSE_ERR',
    )
    if (err) return undefined

    // prepend type attribute
    vplan = { _type: vplanType, ...vplan }

    return vplan
  },

  getQueueDay(vplan) {
    // get date string from vplan title
    const queueDateString = vplan.head.title.trim()
    const queueDate = moment(queueDateString, 'dddd, D. MMMM YYYY')

    if (!queueDate.isValid()) {
      log.err('TITLE_QUEUEDATE_PARSING_ERR', queueDateString)

      return undefined
    }

    const today = moment()
    const queueDay = queueDate.isAfter(today) ? 'next' : 'current'

    log.info('VPLAN_REGISTERED', `${vplan._type}@${queueDay}: [${queueDateString}]`)

    return queueDay
  },
}

module.exports = VPlanParser
