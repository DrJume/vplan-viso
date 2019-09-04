<template>
  <div class="overflow-hidden position-relative">
    <div
      :class="{'hide-curtain': status === 'READY'}"
      class="w-100 h-100 bg-white position-absolute d-flex justify-content-center align-items-center"
    >
      <div
        v-show="status === 'RENDERING'"
        class="spinner-grow"
        style="width: 10rem; height: 10rem;"
      ></div>
      <octicon v-show="status === 'ERROR'" icon="alert" :scale="5"></octicon>
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
      <tbody ref="tableBody">
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
          <td scope="row">{{entry.data.class}}</td>
          <td>{{entry.data.lesson}}</td>
          <td>{{entry.data.subject}}</td>
          <td>{{entry.data.teacher}}</td>
          <td>{{entry.data.room}}</td>
          <td>{{entry.data.info}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "PagingVplanTable",
  props: {
    queue: String
  },
  mounted() {
    this.tableViewport = this.$el
    console.debug({ tableViewport: this.tableViewport })

    this.renderVplan()

    this.$store.subscribe((mutation, state) => {
      console.debug({ PagingVplanTable: "STORE_MUTATION", ...mutation })
      if (mutation.type === "SET_VPLAN") {
        this.renderVplan()
      }
    })
  },
  methods: {
    _sum: arr => arr.reduce((acc, val) => acc + val, 0),

    renderVplan() {
      // Reset data
      this.status = "RENDERING"

      this.$store.commit('SET_VPLAN_PAGECHUNKS', { queue: this.queue, pageChunks: [] })
      this.$store.commit('SET_VPLAN_PAGE', { queue: this.queue, pageNr: 0 })

      this.vplanScreenBuffer = []
      this.vplanPreRenderedPageChunks = []
      this.entriesRenderedCount = 0
      this.entriesVisibleCount = 0
      this.renderTimestamp = Date.now()

      console.debug({ PagingVplanTable: "TIMEOUT_CLEARED", id: this.populateTableCycleID })
      clearTimeout(this.populateTableCycleID)

      console.debug({ vplan: this.Vplan })
      if (this.Vplan === undefined) {
        this.status = "READY"
        return
      }
      this.vplanScreenBuffer = [...this.Vplan]
    },

    vplanEntryVisibilityListener(index, isVisible) {
      if (this.status === "READY") return

      console.debug({ vplanEntryVisibilityListener: "VISIBILITY_CHANGED", id: this.vplanScreenBuffer[index].id, isVisible })

      this.entriesRenderedCount++
      if (isVisible) this.entriesVisibleCount++

      console.debug({ vplanEntryVisibilityListener: "ENTRY_COUNT", entriesRenderedCount: this.entriesRenderedCount, entriesVisibleCount: this.entriesVisibleCount })

      if (
        this._sum(this.vplanPreRenderedPageChunks) + this.entriesRenderedCount === this.Vplan.length // page rendered
      ) {
        if (this.entriesVisibleCount === 0) {
          console.error({ PagingVplanTable: "UNABLE_TO_RENDER_ENTRIES" })
          this.status = "ERROR"
          return
        }

        this.vplanPreRenderedPageChunks.push(this.entriesVisibleCount)

        if (this._sum(this.vplanPreRenderedPageChunks) === this.Vplan.length) { // finished rendering all entries
          setTimeout(() => {
            this.$store.commit("SET_VPLAN_PAGECHUNKS", {
              queue: this.queue,
              pageChunks: this.vplanPreRenderedPageChunks
            })

            this.vplanScreenBuffer = []
            this.status = "READY"

            this.populateTable()
          }, Math.max(0, 1500 - (Date.now() - this.renderTimestamp))) // wait at least 1.5s

          return
        }

        // Render next page

        console.debug({ vplanEntryVisibilityListener: "NEXT_PAGE" })

        this.vplanScreenBuffer = []
        this.entriesRenderedCount = 0
        this.entriesVisibleCount = 0

        // Push remaining entries 
        this.vplanScreenBuffer = this.Vplan.slice(
          this._sum(this.vplanPreRenderedPageChunks)
        )
      }
    },
    populateTable(pageNr = 0) {
      const start = this._sum(this.vplanPreRenderedPageChunks.slice(0, pageNr))
      const end = this._sum(this.vplanPreRenderedPageChunks.slice(0, pageNr + 1))
      this.vplanScreenBuffer = this.Vplan.slice(start, end)

      this.$nextTick(function () {
        this.$store.commit("SET_VPLAN_PAGE", { queue: this.queue, pageNr })

        const tableContentHeight = this.$refs.tableBody.clientHeight
        const tableContentViewportHeight = this.tableViewport.clientHeight - this.$refs.tableHead.clientHeight

        const tableFillRatio = tableContentHeight / tableContentViewportHeight
        console.debug({ PagingVplanTable: "TABLE_FILL_RATIO", tableFillRatio })

        this.populateTableCycleID = setTimeout(() => {
          pageNr++
          pageNr < this.vplanPreRenderedPageChunks.length
            ? this.populateTable(pageNr)
            : this.populateTable(0)
        }, 5000)
        console.debug({ PagingVplanTable: "TIMEOUT_SET", id: this.populateTableCycleID })
      })
    }
  },

  updated() {
    // console.debug({ PagingVplanTable: "UPDATE_HOOK" })
  },

  created() {
    const _debounce = (callback, time = 250, interval) =>
      (...args) => clearTimeout(interval, interval = setTimeout(() => callback(...args), time))

    const debouncedRerender = _debounce(() => {
      console.debug({ PagingVplanTable: "RERENDER_ON_WINDOW_RESIZE" })
      this.renderVplan()
    }, 1500)
    window.addEventListener('resize', debouncedRerender)
  },

  data() {
    return {
      tableViewport: undefined,
      vplanScreenBuffer: [],
      vplanPreRenderedPageChunks: [],
      entriesRenderedCount: 0,
      entriesVisibleCount: 0,
      status: "",
      populateTableCycleID: undefined,
      renderTimestamp: undefined
    }
  },

  computed: {
    Vplan() {
      return this.$store.state.display.vplan[this.queue].data.body
    }
  },

  watch: {
    status(newVal, oldVal) {
      console.debug({ PagingVplanTable: newVal, queue: this.queue })
    }
  }
}
</script>

<style scoped lang="scss">
.hide-curtain {
  display: none !important;
}
</style>
