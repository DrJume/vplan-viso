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
    vplanUploaded: async ({ queue, vplanObj }) => {
      log.info('VPLAN_UPLOADED', `${vplanObj._type} (${queue}): [${vplanObj.head.title}]`)

      await try_(DataManager.writeVPlanFile(
        { type: vplanObj._type, queue },
        JSON.stringify(vplanObj, null, 2),
      ), 'WRITE_VPLAN_ERR')
    },

    vplanRegistered: async ({ type, queue }) => {
      log.info('VPLAN_REGISTERED', `${type} (${queue})`)

      const [err, vplanJSON] = await try_(DataManager.readVPlanFile({ type, queue }), 'READ_VPLAN_ERR')
      if (err) return

      DataManager.setVPlan({ type, queue }, vplanJSON)
      WebSocketSync.syncVplan({
        displayTarget: type,
        vplanJSON,
        queue,
      })
      FTP_Transfer.upload(legacy.uploadPath({
        type,
        queue,
      }), vplanJSON)
    },

    vplanRemoved: async ({ type, queue }) => {
      log.warn('VPLAN_REMOVED', `${type} (${queue})`)

      DataManager.unsetVPlan({ type, queue })
      WebSocketSync.syncVplan({ displayTarget: type, vplanJSON: JSON.stringify({}), queue })
      FTP_Transfer.delete(legacy.uploadPath({ type, queue }))
    },
  })
}

module.exports.run = RunDataReceiver
