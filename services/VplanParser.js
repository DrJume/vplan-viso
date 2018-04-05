const try_ = require('helpers/try-wrapper')

const fanci = require('fanci')

const templateStudents = {
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
    entries => entries.map(entry => ({
      class: entry.klasse._,
      lesson: entry.stunde._,
      subject: entry.fach._,
      teacher: entry.lehrer._,
      room: entry.raum._,
      info: entry.info._,
      changed: Object.keys(entry)
        .map(key => (entry[key].$ ? key : ''))
        .filter(val => val), // filter all solid values
    })),
  ],
  footer: 'vp.fuss.fusszeile.fussinfo._',
}

const VplanFormatter = {
  async format(rawVplanJSObject) {
    let formattedVplanData // eslint-disable-next-line prefer-const
    [, formattedVplanData] = try_(
      () => fanci.transform(rawVplanJSObject, templateStudents),
      'VPLAN_PARSE_ERR',
    )
    return formattedVplanData
  },
}

module.exports = VplanFormatter
