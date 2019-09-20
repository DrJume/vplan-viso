<template>
  <div class="flex-column align-items-center" style="display: flex">
    <table class="table table-striped table-bordered table-sm w-50 text-center mb-0">
      <thead>
        <tr>
          <th scope="col" class="">Aufsicht</th>
        </tr>
      </thead>
      <tbody ref="tableBody" class="text-break">
        <tr v-for="(entry, index) in Supervision" :key="index">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <td scope="row" v-html="entry" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TeacherSupervision',
  props: {
    queue: {
      type: String,
      default: '',
    },
    supervisions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    Supervision() {
      return this.$store.state.display.vplan[this.queue].data.supervision
        .map(entry => entry
          .replace(/-->/g,
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 2 24 24" fill="#212529"><path d="M16 8v-4l8 8-8 8v-4h-16l8-8h8z"/></svg>'))
    },
  },
}
</script>

<style>

</style>
