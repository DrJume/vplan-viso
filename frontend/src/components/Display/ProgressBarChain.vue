<template>
  <div class="border-top border-dark p-1 d-flex flex-row justify-content-between">
    <div v-if="pageChunks.length === 0" class="progress flex-fill m-1" >
      <div class="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
    </div>

    <div v-else class="progress flex-fill m-1" v-for="(pageChunk, index) in pageChunks" :key="index">
      <div class="progress-bar paging-animation" :class="{'paging-progress': (pageChunks.length > 1) && (activePage === index), 'paging-done': index < activePage}"></div>
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
    pageChunks () {
      return this.$store.state.display.vplan[this.queue].paging.pageChunks
    },
    activePage() {
      return this.$store.state.display.vplan[this.queue].paging.activePage
    },
    vplanAvailable() {
      const isObjEmpty = obj => Object.keys(obj).length === 0

      return !isObjEmpty(this.$store.state.display.vplan[this.queue].data)
    }
  },
  data() {
    return {

    }
  },
  watch: {
    pageChunks: (newVal, oldVal) => {

    }
  },
  methods: {
    
  }
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
  animation-duration: 5s;
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
