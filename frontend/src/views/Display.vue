<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="d-flex flex-column w-50 border-right border-dark">
      <VplanHeader v-if="getVplan('current').head" queue="current" class="py-1" />
      <PagingVplanTable v-if="getVplan('current').body" queue="current" class="flex-fill" />
      <Placeholder v-else class="flex-fill" />
      <ProgressBarChain queue="current" class="mt-auto" />
    </div>

    <div class="d-flex flex-column w-50 border-left border-dark">
      <VplanHeader v-if="getVplan('next').head" queue="next" class="py-1" />
      <PagingVplanTable v-if="getVplan('next').body" queue="next" class="flex-fill" />
      <Placeholder v-else class="flex-fill" />
      <ProgressBarChain queue="next" class="mt-auto" />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import getDisplayStore from '@/store/display'
import PagingVplanTable from "@/components/Display/PagingVplanTable.vue"
import VplanHeader from "@/components/Display/VplanHeader.vue"
import ProgressBarChain from "@/components/Display/ProgressBarChain.vue"
import Placeholder from '@/components/Display/Placeholder.vue'

export default {
  name: "Display",
  store: getDisplayStore(),
  components: {
    PagingVplanTable,
    VplanHeader,
    ProgressBarChain,
    Placeholder
  },
  methods: {
    getVplan(queue) {
      return this.$store.state.display.vplan[queue].data
    }
  },
  data() {
    return {

    }
  },
  created() {
    this.$store.commit("SET_DISPLAY_TARGET", this.$route.params.target)
  }
}
</script>
