<template>
  <div class="border-top p-1 d-flex flex-row justify-content-between">
    <div v-if="pageLengths.length === 0" class="progress flex-fill m-1" >
      <div class="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
    </div>

    <div class="progress flex-fill m-1" v-for="(pageLengths, index) in pageLengths" :key="index">
      <div class="progress-bar paging-animation" :class="{'paging-progress': activePage === index, 'paging-done': index < activePage}"></div>
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
    pageLengths () {
      return this.$store.state.vplan[this.queue].display.pageLengths
    },
    activePage() {
      return this.$store.state.vplan[this.queue].display.activePage
    },
    vplanAvailable() {
      const isObjEmpty = obj => Object.keys(obj).length === 0

      return !isObjEmpty(this.$store.state.vplan[this.queue].data)
    }
  },
  data() {
    return {

    }
  },
  watch: {
    pageLengths: (newVal, oldVal) => {

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

// .progress-bar-animated {
//   animation-duration: 0.5s;
// }

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
