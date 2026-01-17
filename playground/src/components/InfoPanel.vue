<template>
  <aside class="card info-panel">
    <h3>Component Map</h3>
    <ul>
      <li v-for="item in items" :key="item.id">
        <strong>{{ item.label }}</strong>
        <span>{{ item.value }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  items: {
    id: number
    label: string
    value: string
  }[]
}>()
</script>
