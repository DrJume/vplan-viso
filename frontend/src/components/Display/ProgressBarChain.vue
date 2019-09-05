<template>
  <div class="border-top border-dark p-1 d-flex flex-row justify-content-between">
    <div v-if="PageChunks.length === 0" class="progress flex-fill m-1">
      <div
        v-if="Status === 'RENDERING'"
        class="progress-bar progress-bar-striped progress-bar-animated w-100"
      ></div>
    </div>

    <div
      v-else
      class="progress flex-fill m-1"
      v-for="(pageChunk, index) in PageChunks"
      :key="index"
    >
      <div
        class="progress-bar paging-animation"
        :style="{'animation-duration': `${pageChunk.displayTime}ms`}"
        :class="{'paging-progress': (PageChunks.length > 1) && (ActivePage === index), 'paging-done': index < ActivePage}"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProgressBarChain",
  props: {
    queue: String
  },
  computed: {
    PageChunks() {
      return this.$store.state.display.vplan[this.queue].paging.pageChunks
    },
    ActivePage() {
      return this.$store.state.display.vplan[this.queue].paging.activePage
    },
    Status() {
      return this.$store.state.display.vplan[this.queue].status
    },
    // vplanAvailable() {
    //   const isObjEmpty = obj => Object.keys(obj).length === 0

    //   return !isObjEmpty(this.$store.state.display.vplan[this.queue].data)
    // }
  },
}
</script>

<style scoped lang="scss">
.progress {
  height: 10px;
}

.progress-bar {
  background-color: #212529;
}

.paging-animation {
  animation-timing-function: linear;
}

.paging-done {
  width: 100%;
}

.paging-progress {
  animation-name: paging-animation;
}

@keyframes paging-animation {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
</style>
