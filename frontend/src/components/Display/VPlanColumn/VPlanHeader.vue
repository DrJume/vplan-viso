<template>
  <div class="text-center border-bottom border-dark">
    <h1 class="mb-0">{{ VPlanHead.title }}</h1>
    <small class="mb-1 font-weight-light">Letzte Änderung am: {{ VPlanHead.created }}</small>
    <!-- eslint-disable vue/no-v-html -->
    <p
      v-if="!!VPlanInfo"
      class="my-1 mx-3 lead rounded-sm bg-light py-2"
      :class="{'large': largeInfoBox}"
      v-html="VPlanInfo"
    />
  </div>
</template>

<script>
export default {
  name: 'VPlanHeader',
  props: {
    queue: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      largeInfoBox: true,
    }
  },
  computed: {
    Status: {
      get() {
        return this.$store.state.display.vplan[this.queue].status
      },
      set(status) {
        this.$store.commit('SET_STATUS', { queue: this.queue, status })
      },
    },
    VPlanHead() {
      return this.$store.state.display.vplan[this.queue].data.head
    },
    VPlanInfo() {
      return JSON.parse(
        JSON.stringify(this.$store.state.display.vplan[this.queue].data.info)
          .replace(/\\n/g, '<br>'),
      )
    },
  },

  watch: {
    Status(status) {
      if (status === 'ADJUST_HEADER') {
        this.updateInfoBoxSize()
      }
    },
  },
  mounted() {
    this.updateInfoBoxSize()
  },

  methods: {
    updateInfoBoxSize() {
      this.largeInfoBox = true

      this.$nextTick(() => {
        const headerFillRatio = this.$el.clientHeight / this.$parent.$el.clientHeight
        console.debug({ VPlanHeader: 'ADJUST_INFOBOX_SIZE', headerFillRatio })

        if (headerFillRatio >= 0.25) this.largeInfoBox = false
        this.$nextTick(() => {
          this.Status = 'RENDER_TABLE'
        })
      })
    },
  },
}
</script>

<style scoped>
.large {
  font-size: 1.5rem;
}
</style>
