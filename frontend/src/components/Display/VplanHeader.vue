<template>
  <div class="text-center py-1">
    <h1 class="mb-3">Donnerstag, 1. August 2017</h1>
    <p class="lead font-italic">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. 
    </p>
  </div>
</template>

<script>
export default {
  name: "TableHeader",
  props: {
    msg: String
  }
};
</script>

<style scoped lang="scss">
.lead {
  font-size: 1.5rem;
}
</style>
