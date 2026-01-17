<template>
  <div class="page">
    <header class="hero">
      <div class="brand">Vue Grab Playground</div>
      <p class="subtitle">
        Hover to inspect components. Click to copy file metadata to your clipboard.
      </p>
      <div class="hero-actions">
        <button class="primary" type="button" @click="toggleDetails">
          Toggle Details
        </button>
        <span class="hint">Grab mode: dev-only</span>
      </div>
    </header>

    <section class="grid">
      <CounterCard title="Clicks" :initial="3" />
      <CounterCard title="Stars" :initial="12" />
      <CounterCard title="Highlights" :initial="7" />
      <InfoPanel v-if="showDetails" :items="items" />
    </section>

    <section class="stage">
      <div class="stage-card">
        <h2>Component Stage</h2>
        <p>Use this block to test nested slots and props.</p>
        <div class="slot-grid">
          <span class="tag">Alpha</span>
          <span class="tag">Beta</span>
          <span class="tag">Gamma</span>
        </div>
      </div>
    </section>

    <footer class="foot">
      <span>Inspect different blocks to see file/line references.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CounterCard from './components/CounterCard.vue'
import InfoPanel from './components/InfoPanel.vue'

const showDetails = ref(true)
const items = ref([
  { id: 1, label: 'Overlay', value: 'Active in dev' },
  { id: 2, label: 'Copy on click', value: 'Enabled' },
  { id: 3, label: 'Workspace', value: 'pnpm monorepo' },
])

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}
</script>
