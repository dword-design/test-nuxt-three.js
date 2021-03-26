<template>
  <div />
</template>

<script>
import { property } from '@dword-design/functions'

export default {
  async mounted() {
    this.$el.appendChild(this.value() |> await |> property('domElement'))
  },
  props: {
    value: { type: Function },
  },
}
</script>
