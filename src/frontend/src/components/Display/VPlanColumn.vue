<template>
  <div class="d-flex flex-column h-100">
    <VPlanHeader v-if="VPlan.head" :queue="queue" class="py-1" />
    <PagingVPlanTable
      v-if="VPlan.body"
      :queue="queue"
      class="flex-fill"
      @step-page="activePage = $event"
    />
    <Placeholder v-else class="flex-fill" />
    <ProgressBarChain :queue="queue" :active-page="activePage" class="mt-auto" />
  </div>
</template>

<script>
import PagingVPlanTable from '@/components/Display/VPlanColumn/PagingVPlanTable.vue'
import VPlanHeader from '@/components/Display/VPlanColumn/VPlanHeader.vue'
import ProgressBarChain from '@/components/Display/VPlanColumn/ProgressBarChain.vue'
import Placeholder from '@/components/Display/VPlanColumn/Placeholder.vue'

export default {
  name: 'VPlanColumn',
  components: {
    PagingVPlanTable,
    VPlanHeader,
    ProgressBarChain,
    Placeholder,
  },
  props: {
    queue: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      activePage: 0,
    }
  },
  computed: {
    VPlan() {
      return this.$store.state.display.vplan[this.queue].data
    },
    Status: {
      get() {
        return this.$store.state.display.vplan[this.queue].status
      },
      set(status) {
        this.$store.commit('SET_STATUS', { queue: this.queue, status })
      },
    },
  },
  created() {
    const _debounce = (callback, time = 250, interval) => (...args) => {
      clearTimeout(interval, interval = setTimeout(() => callback(...args), time))
    }

    this._debouncedRerender = _debounce(() => {
      console.debug({ VPlanColumn: 'RERENDER_ON_WINDOW_RESIZE' })
      this.Status = 'ADJUST_HEADER'
    }, 1500)

    window.addEventListener('resize', this._debouncedRerender)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._debouncedRerender)
  },
}
</script>

<style>

</style>
