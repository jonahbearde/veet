<template>
  <div>
    {{ foo }}
  </div>
</template>

<script>
import { ref } from "vue"
export default {
  setup() {
    const foo = ref("bar")
    return {
      foo,
    }
  },
}
</script>

<style scoped></style>
