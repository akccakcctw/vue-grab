<template>
  <article class="card counter-card">
    <div class="card-header">
      <h3>{{ title }}</h3>
      <span class="badge">{{ count }}</span>
    </div>
    <p class="hint">Tap the button to update state.</p>
    <button class="ghost" type="button" @click="count++">+1</button>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  initial?: number
}>()

const count = ref(props.initial ?? 0)
</script>
