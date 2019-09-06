<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="d-flex flex-column w-50 border-right border-dark">
      <VPlanHeader v-if="getVPlan('current').head" queue="current" class="py-1" />
      <PagingVPlanTable v-if="getVPlan('current').body" queue="current" class="flex-fill" />
      <Placeholder v-else class="flex-fill" />
      <ProgressBarChain queue="current" class="mt-auto" />
    </div>

    <div class="d-flex flex-column w-50 border-left border-dark">
      <VPlanHeader v-if="getVPlan('next').head" queue="next" class="py-1" />
      <PagingVPlanTable v-if="getVPlan('next').body" queue="next" class="flex-fill" />
      <Placeholder v-else class="flex-fill" />
      <ProgressBarChain queue="next" class="mt-auto" />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// eslint-disable-next-line import/extensions
import getDisplayStore from '@/store/display'
import PagingVPlanTable from '@/components/Display/PagingVPlanTable.vue'
import VPlanHeader from '@/components/Display/VPlanHeader.vue'
import ProgressBarChain from '@/components/Display/ProgressBarChain.vue'
import Placeholder from '@/components/Display/Placeholder.vue'

export default {
  name: 'Display',
  store: getDisplayStore(),
  components: {
    PagingVPlanTable,
    VPlanHeader,
    ProgressBarChain,
    Placeholder,
  },
  created() {
    this.$store.commit('SET_DISPLAY_TARGET', this.$route.params.target)
  },
  methods: {
    getVPlan(queue) {
      return this.$store.state.display.vplan[queue].data
    },
  },
}
</script>
