<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="w-50 border-right border-dark">
      <VPlanColumn queue="current" />
    </div>

    <div class="w-50 border-left border-dark">
      <VPlanColumn queue="next" />
    </div>

    <span
      class="position-fixed"
      style="top: 0px; right: 2px; font-size: 10px;"
    >v{{ version }}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import pkg from '@/../package.json'

// eslint-disable-next-line import/extensions
import getDisplayStore from '@/store/display'
import VPlanColumn from '@/components/Display/VPlanColumn.vue'

export default {
  name: 'Display',
  components: {
    VPlanColumn,
  },
  props: {
    target: {
      type: String,
      default: '',
    },
  },
  computed: {
    version() {
      return pkg.version
    },
  },
  created() {
    this.$store = getDisplayStore()

    this.$store.subscribe((mutation) => {
      console.debug({ Display: 'STORE_MUTATION', ...mutation })
    })
  },
  mounted() {
    this.$store.dispatch('wsConnect', this.target)
  },
}
</script>
