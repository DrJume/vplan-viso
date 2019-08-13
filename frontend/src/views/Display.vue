<template>
  <div class="d-flex flex-row vw-100 vh-100">
    <div class="d-flex flex-column w-50 border-right">
      <VplanHeader/>
      <PagingVplanTable class=""/>
    </div>
    <!-- <div class="d-flex flex-column w-50 border-left">
      <VplanHeader/>
      <PagingVplanTable class=""/>
    </div> -->
  </div>
</template>

<script>
// @ is an alias to /src
import PagingVplanTable from '@/components/Display/PagingVplanTable.vue'
import VplanHeader from '@/components/Display/VplanHeader.vue'

export default {
  name: 'home',
  components: {
    PagingVplanTable,
    VplanHeader
  }
}
</script>
