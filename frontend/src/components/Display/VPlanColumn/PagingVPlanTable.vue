<template>
  <div class="overflow-hidden position-relative">
    <div
      :class="{ 'hide-curtain': Status === 'READY', }"
      class="w-100 h-100 bg-white position-absolute
        d-flex justify-content-center align-items-center"
    >
      <div
        v-show="Status === 'RENDERING'"
        class="spinner-grow"
        style="width: 10rem; height: 10rem;"
      />
      <div
        v-if="Status === 'ERR_VIEWPORT_OVERFLOW'"
        class="h-50 d-flex flex-column align-items-center justify-content-around"
      >
        <Octicon icon="alert" :scale="5" />
        <Octicon icon="screen-normal" :scale="3" />
      </div>
    </div>

    <table v-if="!!tableViewport" class="table table-striped table-sm border-bottom">
      <thead ref="tableHead">
        <tr>
          <th scope="col" class="border-top-0">Klasse</th>
          <th scope="col" class="border-top-0">Stunde</th>
          <th scope="col" class="border-top-0">Fach</th>
          <th scope="col" class="border-top-0">Lehrer</th>
          <th scope="col" class="border-top-0">Raum</th>
          <th scope="col" class="border-top-0">Info</th>
        </tr>
      </thead>
      <tbody ref="tableBody" class="text-break">
        <tr
          v-for="(entry, index) in vplanScreenBuffer"
          :key="`${entry._id}_${renderTimestamp}`"
          v-observe-visibility="{
            callback: (isVisible, entry) => {
              vplanEntryVisibilityListener(index, isVisible)
            },
            once: true,
            intersection: {
              root: tableViewport,
              threshold: 1.0,
            },
          }"
        >
          <td scope="row">{{ entry.class }}</td>
          <td>{{ entry.lesson }}</td>
          <td>{{ entry.subject }}</td>
          <td>{{ entry.teacher }}</td>
          <td>{{ entry.room }}</td>
          <td>{{ entry.info }}</td>
        </tr>
      </tbody>
    </table>
    <TeacherSupervision
      v-if="VPlanType === 'teachers' && isSupervisionTableVisible && Status === 'READY'"
      v-observe-visibility="{
        callback: (isVisible, element) => {
          vplanSupervisionVisibilityListener(isVisible, element)
        },
        once: true,
        intersection: {
          root: tableViewport,
          threshold: 1.0,
        },
      }"
      :queue="queue"
    />
  </div>
</template>

<script>
import TeacherSupervision from '@/components/Display/VPlanColumn/TeacherSupervision.vue'

export default {
  name: 'PagingVPlanTable',
  components: {
    TeacherSupervision,
  },
  props: {
    queue: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      tableViewport: undefined,
      vplanScreenBuffer: [],
      vplanPageChunks: [],
      entriesRenderedCount: 0,
      entriesVisibleCount: 0,
      populateTableCycleID: undefined,
      renderTimestamp: undefined,
      isSupervisionTableVisible: false,
    }
  },

  computed: {
    VPlan() {
      return this.$store.state.display.vplan[this.queue].data.body
    },
    VPlanType() {
      return this.$store.state.display.vplan[this.queue].data._type
    },
    Status: {
      get() {
        return this.$store.state.display.vplan[this.queue].status
      },
      set(status) {
        this.$store.commit('SET_STATUS', { queue: this.queue, status })
      },
    },
  },

  watch: {
    Status(status) {
      if (status === 'RENDER_TABLE') {
        this.renderVPlanTable()
      }
    },
  },
  mounted() {
    this.tableViewport = this.$el
    console.debug({ tableViewport: this.tableViewport })
  },

  methods: {
    renderVPlanTable() {
      // Reset data
      this.Status = 'RENDERING'

      this.$store.commit('SET_VPLAN_PAGECHUNKS', { queue: this.queue, pageChunks: [] })

      this.vplanScreenBuffer = []
      this.vplanPageChunks = []
      this.entriesRenderedCount = 0
      this.entriesVisibleCount = 0
      this.renderTimestamp = Date.now()

      console.debug({ PagingVPlanTable: 'TIMEOUT_CLEARED', id: this.populateTableCycleID })
      clearTimeout(this.populateTableCycleID)

      console.debug({ vplan: this.VPlan })
      if (this.VPlan === undefined) {
        this.Status = 'READY'
        return
      }
      this.vplanScreenBuffer = [...this.VPlan]
    },

    vplanSupervisionVisibilityListener(isVisible) {
      if (this.vplanScreenBuffer.length === 0 && !isVisible) {
        console.error({ PagingVPlanTable: 'UNABLE_TO_DISPLAY_SUPERVISION' })
        this.isSupervisionTableVisible = true
        return
      }

      this.isSupervisionTableVisible = isVisible
    },

    vplanEntryVisibilityListener(index, isVisible) {
      if (this.Status !== 'RENDERING') return

      const getPageChunksSum = () => this.vplanPageChunks.reduce((acc, val) => acc + val.length, 0)

      console.debug({ vplanEntryVisibilityListener: 'VISIBILITY_CHANGED', id: this.vplanScreenBuffer[index]._id, isVisible })

      this.entriesRenderedCount++
      if (isVisible) this.entriesVisibleCount++

      console.debug({ vplanEntryVisibilityListener: 'ENTRY_COUNT', entriesRenderedCount: this.entriesRenderedCount, entriesVisibleCount: this.entriesVisibleCount })

      if (
        getPageChunksSum() + this.entriesRenderedCount
        !== this.VPlan.length // page not fully rendered
      ) return

      if (this.entriesVisibleCount === 0) {
        console.error({ PagingVPlanTable: 'UNABLE_TO_RENDER_ENTRIES' })
        this.Status = 'ERR_VIEWPORT_OVERFLOW'
        return
      }

      this.vplanScreenBuffer.splice(this.entriesVisibleCount)

      this.$nextTick(() => {
        // Calculate displayTime from table fill ratio
        const tableContentHeight = this.$refs.tableBody.clientHeight
        const tableContentViewportHeight = this.tableViewport.clientHeight
          - this.$refs.tableHead.clientHeight

        const tableFillRatio = tableContentHeight / tableContentViewportHeight
        console.debug({ PagingVPlanTable: 'TABLE_FILL_RATIO', tableFillRatio })

        this.vplanPageChunks.push({
          head: this.VPlan.length - this.entriesRenderedCount,
          length: this.entriesVisibleCount,
          displayTime: tableFillRatio <= 0.4 ? 5000 : 11000,
        })

        if (getPageChunksSum() === this.VPlan.length) { // finished rendering all entries
          setTimeout(() => {
            if (this.VPlanType === 'teachers' && !this.isSupervisionTableVisible) {
              this.vplanPageChunks.push({
                head: this.VPlan.length,
                length: 0,
                displayTime: 6000,
              })
            }

            this.$store.commit('SET_VPLAN_PAGECHUNKS', {
              queue: this.queue,
              pageChunks: this.vplanPageChunks,
            })

            this.vplanScreenBuffer = []
            this.Status = 'READY'

            this.populateTable()
          }, Math.max(0, 1500 - (Date.now() - this.renderTimestamp))) // wait at least 1.5s

          return
        }

        // Render next page

        console.debug({ vplanEntryVisibilityListener: 'NEXT_PAGE' })

        this.vplanScreenBuffer = []
        this.entriesRenderedCount = 0
        this.entriesVisibleCount = 0

        // Push remaining entries
        this.vplanScreenBuffer = this.VPlan.slice(
          getPageChunksSum(),
        )
      })
    },

    populateTable(pageNr = 0) {
      const { head, length, displayTime } = this.vplanPageChunks[pageNr]
      this.vplanScreenBuffer = this.VPlan.slice(head, head + length)
      console.debug({
        PagingVPlanTable: 'PAGE_CHUNKS', head, end: head + length, length, displayTime,
      })

      this.$emit('step-page', pageNr)
      this.isSupervisionTableVisible = true

      this.populateTableCycleID = setTimeout(() => {
        pageNr++
        if (pageNr < this.vplanPageChunks.length) {
          this.populateTable(pageNr)
        } else {
          this.populateTable(0) // TODO: modulo cycling formula
        }
      }, displayTime)
      console.debug({ PagingVPlanTable: 'TIMEOUT_SET', id: this.populateTableCycleID })
    },
  },
}
</script>

<style scoped>
.hide-curtain {
  display: none !important;
}
</style>
