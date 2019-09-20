<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="w-50 border-right border-dark">
      <VPlanColumn queue="current" />
    </div>

    <div class="w-50 border-left border-dark">
      <VPlanColumn queue="next" />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// eslint-disable-next-line import/extensions
import getDisplayStore from '@/store/display'
import VPlanColumn from '@/components/Display/VPlanColumn.vue'

export default {
  name: 'Display',
  components: {
    VPlanColumn,
  },
  created() {
    this.$store = getDisplayStore()

    this.$store.subscribe((mutation) => {
      console.debug({ Display: 'STORE_MUTATION', ...mutation })
    })
  },
  mounted() {
    this.$store.dispatch('wsConnect', this.$route.params.target)
  },
}
</script>
