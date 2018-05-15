const try_ = require('helpers/try-wrapper')

const fanci = require('fanci')

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
}

const VplanParser = {
  detectType(rawVplanJSObject) {
    return VplanType.STUDENTS
  },

  async transform(rawVplanJSObject) {
    const vplanType = this.detectType(rawVplanJSObject)

    const [, transformedVplanData] = try_(
      () => fanci.transform(rawVplanJSObject, Templates[vplanType]),
      'VPLAN_PARSE_ERR',
    )
    return { transformedVplanData, vplanType }
  },
}

module.exports = VplanParser
