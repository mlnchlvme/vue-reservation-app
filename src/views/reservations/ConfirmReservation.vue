<template>
  <section class="container max-w-lg">
    <h2 class="text-2xl font-semibold mb-4">Reservation confirmation</h2>

    <div v-if="loading" class="text-gray-500">Confirming your reservation...</div>

    <article v-else-if="error" class="card border-red-200">
      <div class="text-red-700 font-medium mb-2">❌ Confirmation failed</div>
      <pre class="whitespace-pre-wrap text-sm">{{ error }}</pre>
    </article>

    <article v-else-if="data" class="card border-green-200">
      <div class="text-green-700 font-medium mb-2">✅ Reservation confirmed successfully!</div>
      <ul class="text-sm space-y-1">
        <li><strong>Table ID:</strong> {{ data.table }}</li>
        <li><strong>Date:</strong> {{ data.date }}</li>
        <li><strong>Time:</strong> {{ formatTime(data.time) }}</li>
        <li><strong>Duration:</strong> {{ formatDuration(data.duration) }}</li>
      </ul>
      <router-link class="btn mt-3" to="/tables">Back to tables</router-link>
    </article>

    <article v-else class="card border-yellow-200">
      <div class="text-yellow-700">Unknown confirmation status.</div>
    </article>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api/http'

const route = useRoute()
const data = ref(null)
const loading = ref(false)
const error = ref('')

const formatTime = (time) => time ? time.slice(0, 5) : '—'
const formatDuration = (d) => {
  if (!d) return '—'
  const minutes = Math.floor(d / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins ? mins + 'm' : ''}`
}

onMounted(async () => {
  loading.value = true
  try {
    const { data: res } = await http.get(`/reservation/confirm/${route.params.token}/`)
    data.value = res
  } catch (e) {
    const resp = e?.response
    if (resp?.data && typeof resp.data === 'object') {
      error.value = Object.entries(resp.data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('; ') : String(v)}`)
        .join('\n')
    } else if (typeof resp?.data === 'string') {
      error.value = resp.data
    } else {
      error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Confirmation failed')
    }
  } finally {
    loading.value = false
  }
}) 
</script>
