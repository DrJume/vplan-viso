<template>
  <div class="overflow-auto position-relative">
    <div
      :class="{'hide-spinner': status === 'READY'}"
      class="w-100 h-100 bg-white position-absolute d-flex justify-content-center align-items-center"
    >
      <div class="spinner-grow" style="width: 10rem; height: 10rem;"></div>
    </div>

    <table class="table table-striped table-sm">
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
import { setTimeout } from 'timers'
export default {
  name: "PagingTable",
  props: {
    msg: String
  },
  methods: {
    _sum: arr => arr.reduce((acc, val) => acc + val, 0),

    entryVisibilityChanged(index, isVisible) {
      if (this.status === 'READY') return

      console.log({ id: this.vplanScreenBuffer[index].id, isVisible })
      if (!isVisible) this.$delete(this.vplanScreenBuffer, index)

      this.entriesRendered++
      if (isVisible) this.entriesVisible++

      console.log(this.entriesRendered)

      if (this.entriesRendered + this._sum(this.vplanPreRenderedSlices) === this.vplan.length) {
        this.vplanPreRenderedSlices.push(this.entriesVisible)

        if (this._sum(this.vplanPreRenderedSlices) >= this.vplan.length) {
          this.vplanScreenBuffer = []
          this.status = "READY"
          this.displayVplan()
          return
        }
        console.log("NEXT_PAGE")
        this.vplanScreenBuffer = []
        this.status = "NEXT_PAGE"
      }
    },

    displayVplan() {
      this.populatePage()
    },

    populatePage(i = 0, acc = 0) {
      const start = acc
      const end = acc+this.vplanPreRenderedSlices[i]
      this.vplanScreenBuffer = this.vplan.slice(start, end)

      setTimeout(() => {
        i++
        i < this.vplanPreRenderedSlices.length ? this.populatePage(i, end) : this.populatePage()
      }, 5000)
    }
  },
  updated() {
    console.log("UPDATED")
    if (this.status === "NEXT_PAGE") {
      this.status = "RENDERING_PAGE"
      this.entriesRendered = 0
      this.entriesVisible = 0
      this.vplanScreenBuffer = this.vplan.slice(
        this._sum(this.vplanPreRenderedSlices)
      )
    }
  },
  created() {
    let mockData = []
    for (let i = 1; i <= 50; i++) {
      mockData.push({
        id: i,
        data: {
          class: "6a",
          lesson: i,
          subject: "FR",
          teacher: "Nen",
          room: "116",
          info: "Für FR Sch"
        }
      })
    }
    this.vplan = mockData

    this.status = 'RENDERING_PAGE'
    this.vplanScreenBuffer = [...this.vplan]
  },
  data() {
    return {
      intersectionObserverRoot: this.$el,
      vplan: [],
      vplanScreenBuffer: [],
      vplanPreRenderedSlices: [],
      entriesRendered: 0,
      entriesVisible: 0,
      status: ""
    }
  }
}
</script>

<style scoped lang="scss">
.hide-spinner {
  display: none !important;
}
</style>
