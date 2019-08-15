<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="d-flex flex-column w-50 border-right">
      <VplanHeader v-if="getVplan('current').head" queue="current" class="py-1" />
      <PagingVplanTable v-if="getVplan('current').body" queue="current" class="mb-1 flex-fill" />
      <ProgressBarChain v-if="getVplan('current').body" queue="current" class="mt-auto" />
    </div>

    <div class="d-flex flex-column w-50 border-left">
      <VplanHeader v-if="getVplan('next').head" queue="next" class="py-1" />
      <PagingVplanTable v-if="getVplan('next').body" queue="next" class="mb-1 flex-fill" />
      <ProgressBarChain v-if="getVplan('next').body" queue="next" class="mt-auto" />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import PagingVplanTable from "@/components/Display/PagingVplanTable.vue"
import VplanHeader from "@/components/Display/VplanHeader.vue"
import ProgressBarChain from "@/components/Display/ProgressBarChain.vue"

export default {
  name: "Display",
  components: {
    PagingVplanTable,
    VplanHeader,
    ProgressBarChain
  },
  methods: {
    getVplan(queue) {
      return this.$store.state.vplan[queue].data
    }
  },
  data() {
    return {
      
    }
  },
  created() {
    let mockData = {
      type: "students",
      body: [],
      head: [],
      info: []
    }
    for (let i = 1; i <= 50; i++) {
      mockData.body.push({
        id: i,
        data: {
          class: "6a",
          lesson: i,
          subject: "FR",
          teacher: "Nen",
          room: "116",
          info: "Für FR Sch"
        }
      })
    }
    this.$store.commit("UPDATE_VPLAN", { queue: 'current', vplan: mockData })
  }
}
</script>
