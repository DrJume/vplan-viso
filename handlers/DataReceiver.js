const FileWatcher = require('services/FileWatcher')
const DataManager = require('services/DataManager')

const FTP_Transfer = require('services/FTP-Transfer')
const WebSocketSync = require('services/WebSocketSync')

const legacy = {
  uploadPath({ type, queue }) {
    return `upload/${queue}/${type}.json`
  },
}

async function RunDataReceiver() {
  FileWatcher({
    vplanUploaded: async ({ queueDay, vplan }) => {
      log.info('VPLAN_ADDED', `${vplan._type} (${queueDay}): [${vplan.head.title}]`)

      await try_(DataManager.writeVPlan(
        { type: vplan._type, queue: queueDay },
        JSON.stringify(vplan, null, 2),
      ), 'WRITE_VPLAN_ERR')
    },

    vplanRegistered: async ({ type, queue }) => {
      const [err, vplanJSON] = await try_(DataManager.readVPlan({ type, queue }), 'READ_VPLAN_ERR')
      if (err) return

      WebSocketSync.syncVplan({
        displayTarget: type,
        vplanJSON,
        queue,
      })
    },
    vplanChanged: async ({ type, queue }) => {
      const [err, vplanJSON] = await try_(DataManager.readVPlan({ type, queue }), 'READ_VPLAN_ERR')
      if (err) return

      WebSocketSync.syncVplan({
        displayTarget: type,
        vplanJSON,
        queue,
      })

      log.warn('LEGACY_FTP_PATH', legacy.uploadPath({ type, queue }))
      await FTP_Transfer.upload(legacy.uploadPath({ type, queue }), vplanJSON)
    },
    vplanRemoved: async ({ type, queue }) => {
      WebSocketSync.syncVplan({ displayTarget: type, vplanJSON: '{}', queue })

      log.warn('LEGACY_FTP_PATH', legacy.uploadPath({ type, queue }))
      await FTP_Transfer.delete(legacy.uploadPath({ type, queue }))
    },
  })
}

module.exports.run = RunDataReceiver
