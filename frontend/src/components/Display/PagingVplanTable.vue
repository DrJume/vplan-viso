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
        <octicon icon="alert" :scale="5" />
        <octicon icon="screen-normal" :scale="3" />
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
          :key="`${entry.id}_${renderTimestamp}`"
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
          <td scope="row">{{ entry.data.class }}</td>
          <td>{{ entry.data.lesson }}</td>
          <td>{{ entry.data.subject }}</td>
          <td>{{ entry.data.teacher }}</td>
          <td>{{ entry.data.room }}</td>
          <td>{{ entry.data.info }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PagingVplanTable',
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
    }
  },

  computed: {
    Vplan() {
      return this.$store.state.display.vplan[this.queue].data.body
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
    Status(newVal) {
      console.debug({ PagingVplanTable: newVal, queue: this.queue })
    },
  },

  mounted() {
    this.tableViewport = this.$el
    console.debug({ tableViewport: this.tableViewport })

    this.renderVplan()

    this.$store.subscribe((mutation) => {
      console.debug({ PagingVplanTable: 'STORE_MUTATION', ...mutation })
      if (mutation.type === 'SET_VPLAN') {
        this.renderVplan()
      }
    })
  },

  updated() {
    // console.debug({ PagingVplanTable: "UPDATE_HOOK" })
  },

  created() {
    const _debounce = (callback, time = 250, interval) => (...args) => {
      clearTimeout(interval, interval = setTimeout(() => callback(...args), time))
    }

    const debouncedRerender = _debounce(() => {
      console.debug({ PagingVplanTable: 'RERENDER_ON_WINDOW_RESIZE' })
      this.renderVplan()
    }, 1500)
    window.addEventListener('resize', debouncedRerender)
  },

  methods: {
    renderVplan() {
      // Reset data
      this.Status = 'RENDERING'

      this.$store.commit('SET_VPLAN_PAGECHUNKS', { queue: this.queue, pageChunks: [] })
      this.$store.commit('SET_VPLAN_PAGE', { queue: this.queue, pageNr: 0 })

      this.vplanScreenBuffer = []
      this.vplanPageChunks = []
      this.entriesRenderedCount = 0
      this.entriesVisibleCount = 0
      this.renderTimestamp = Date.now()

      console.debug({ PagingVplanTable: 'TIMEOUT_CLEARED', id: this.populateTableCycleID })
      clearTimeout(this.populateTableCycleID)

      console.debug({ vplan: this.Vplan })
      if (this.Vplan === undefined) {
        this.Status = 'READY'
        return
      }
      this.vplanScreenBuffer = [...this.Vplan]
    },

    vplanEntryVisibilityListener(index, isVisible) {
      if (this.Status === 'READY') return

      const getPageChunksSum = () => this.vplanPageChunks.reduce((acc, val) => acc + val.length, 0)

      console.debug({ vplanEntryVisibilityListener: 'VISIBILITY_CHANGED', id: this.vplanScreenBuffer[index].id, isVisible })

      this.entriesRenderedCount++
      if (isVisible) this.entriesVisibleCount++

      console.debug({ vplanEntryVisibilityListener: 'ENTRY_COUNT', entriesRenderedCount: this.entriesRenderedCount, entriesVisibleCount: this.entriesVisibleCount })

      if (
        getPageChunksSum() + this.entriesRenderedCount
        !== this.Vplan.length // page not fully rendered
      ) return

      if (this.entriesVisibleCount === 0) {
        console.error({ PagingVplanTable: 'UNABLE_TO_RENDER_ENTRIES' })
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
        console.debug({ PagingVplanTable: 'TABLE_FILL_RATIO', tableFillRatio })

        this.vplanPageChunks.push({
          head: this.Vplan.length - this.entriesRenderedCount,
          length: this.entriesVisibleCount,
          displayTime: tableFillRatio <= 0.4 ? 5000 : 11000,
        })

        if (getPageChunksSum() === this.Vplan.length) { // finished rendering all entries
          setTimeout(() => {
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
        this.vplanScreenBuffer = this.Vplan.slice(
          getPageChunksSum(),
        )
      })
    },

    populateTable(pageNr = 0) {
      const { head, length, displayTime } = this.vplanPageChunks[pageNr]
      this.vplanScreenBuffer = this.Vplan.slice(head, head + length)
      console.debug({
        PagingVplanTable: 'PAGE_CHUNKS', head, end: head + length, length, displayTime,
      })

      this.$store.commit('SET_VPLAN_PAGE', { queue: this.queue, pageNr })

      this.populateTableCycleID = setTimeout(() => {
        pageNr++
        if (pageNr < this.vplanPageChunks.length) {
          this.populateTable(pageNr)
        } else {
          this.populateTable(0)
        }
      }, displayTime)
      console.debug({ PagingVplanTable: 'TIMEOUT_SET', id: this.populateTableCycleID })
    },
  },
}
</script>

<style scoped>
.hide-curtain {
  display: none !important;
}
</style>
