<template>
  <div class="overflow-hidden position-relative">
    <div
      :class="{'hide-spinner': status === 'DONE_RENDERING'}"
      class="w-100 h-100 bg-white position-absolute d-flex justify-content-center align-items-center"
    >
      <div class="spinner-grow" style="width: 10rem; height: 10rem;"></div>
    </div>

    <table v-if="!!intersectionObserverRoot" class="table table-striped table-sm border-bottom">
      <thead>
        <tr>
          <th scope="col">Klasse</th>
          <th scope="col">Stunde</th>
          <th scope="col">Fach</th>
          <th scope="col">Leherer</th>
          <th scope="col">Raum</th>
          <th scope="col">Info</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, index) in vplanScreenBuffer"
          :key="entry.id"
          v-observe-visibility="{
            callback: (isVisible, entry) => {
              // if (isVisible) return 
              entryVisibilityChanged(index, isVisible)
            },
            once: true,
            intersection: {
              root: intersectionObserverRoot,
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
  methods: {
    _sum: arr => arr.reduce((acc, val) => acc + val, 0),

    entryVisibilityChanged(index, isVisible) {
      if (this.status === "DONE_RENDERING") return

      // console.log({ id: this.vplanScreenBuffer[index].id, isVisible })
      if (!isVisible) this.$delete(this.vplanScreenBuffer, index)

      this.entriesRendered++
      if (isVisible) this.entriesVisible++

      // console.log(this.entriesRendered)

      if (
        this.entriesRendered + this._sum(this.vplanPreRenderedPageLengths) ===
        this.vplan.length
      ) {
        this.vplanPreRenderedPageLengths.push(this.entriesVisible)

        if (this._sum(this.vplanPreRenderedPageLengths) >= this.vplan.length) {
          this.vplanScreenBuffer = []
          this.status = "DONE_RENDERING"
          console.log('DONE')
          this.displayVplan()
          return
        }
        console.log("NEXT_PAGE")
        this.vplanScreenBuffer = []
        this.status = "NEXT_PAGE"
      }
    },

    displayVplan() {
      this.$store.commit('SET_VPLAN_PAGELENGTHS', {queue: this.queue, pageLengths: this.vplanPreRenderedPageLengths})
      this.populatePage()
    },

    populatePage(i = 0, acc = 0) {
      const start = acc
      const end = acc + this.vplanPreRenderedPageLengths[i]
      this.vplanScreenBuffer = this.vplan.slice(start, end)

      this.$store.commit('SET_VPLAN_PAGE', {queue: this.queue, pageNr: i})

      setTimeout(() => {
        i++
        i < this.vplanPreRenderedPageLengths.length
          ? this.populatePage(i, end)
          : this.populatePage()
      }, 5000)
    }
  },
  updated() {
    // console.log("UPDATED")
    if (this.status === "NEXT_PAGE") {
      this.status = "RENDERING_PAGE"
      this.entriesRendered = 0
      this.entriesVisible = 0
      this.vplanScreenBuffer = this.vplan.slice(
        this._sum(this.vplanPreRenderedPageLengths)
      )
    }
  },
  mounted() {
    this.intersectionObserverRoot = this.$el
    console.log(this.intersectionObserverRoot)

    this.status = "RENDERING_PAGE"
    console.log(this.vplan)
    if (this.vplan === undefined) {
      this.status = "DONE_RENDERING"
      return
    }
    this.vplanScreenBuffer = [...this.vplan]
  },
  created() {
    
  },
  data() {
    return {
      intersectionObserverRoot: undefined,
      vplanScreenBuffer: [],
      vplanPreRenderedPageLengths: [],
      entriesRendered: 0,
      entriesVisible: 0,
      status: ""
    }
  },
  computed: {
    vplan() {
      return this.$store.state.vplan[this.queue].data.body
    }
  }
}
</script>

<style scoped lang="scss">
.hide-spinner {
  display: none !important;
}
</style>
