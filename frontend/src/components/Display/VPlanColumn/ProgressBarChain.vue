<template>
  <div class="border-top border-dark p-1 d-flex flex-row justify-content-between">
    <div v-if="PageChunks.length === 0" class="progress flex-fill m-1">
      <div
        v-if="Status === 'RENDERING'"
        class="progress-bar progress-bar-striped progress-bar-animated w-100"
      />
    </div>

    <div
      v-for="(pageChunk, index) in PageChunks"
      v-else
      :key="index"
      class="progress flex-fill m-1"
    >
      <div
        class="progress-bar paging-animation"
        :style="{'animation-duration': `${pageChunk.displayTime}ms`}"
        :class="{'paging-progress': (PageChunks.length > 1) && (activePage === index),
                 'paging-done': index < activePage}"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBarChain',
  props: {
    queue: {
      type: String,
      default: '',
    },
    activePage: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    PageChunks() {
      return this.$store.state.display.vplan[this.queue].pageChunks
    },
    Status() {
      return this.$store.state.display.vplan[this.queue].status
    },
  },
}
</script>

<style scoped>
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
