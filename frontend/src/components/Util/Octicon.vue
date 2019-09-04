<template>
  <span v-html="getSVG()"></span>
</template>

<script>
import octicons from '@primer/octicons'

export default {
  name: "octicon",
  props: {
    icon: {
      type: String,
      required: true
    },
    scale: {
      type: Number,
      default: 1
    },
    className: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    }
  },
  methods: {
    getSVG() {
      return octicons[this.icon].toSVG({
        width: (octicons[this.icon].width * this.scale),
        height: (octicons[this.icon].height * this.scale),
        class: this.className,
        'aria-label': this.label
      })
    }
  }
}
</script>

<style scoped>
.octicon {
  display: inline-block;
  vertical-align: text-top;
  fill: currentColor;
}
</style>