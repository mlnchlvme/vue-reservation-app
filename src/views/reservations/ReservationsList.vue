<template>
  <section class="container">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Reservations</h2>
      <button class="btn-ghost" @click="fetchList()">Reload</button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <pre v-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</pre>

    <div v-if="!loading && !error && items.length"
         class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="r in items" :key="r.id" class="card">
        <header class="flex items-center justify-between">
          <strong>#{{ r.id }}</strong>
          <router-link class="btn-ghost" :to="`/reservations/${r.id}`">Open</router-link>
        </header>
        <dl class="mt-3 text-sm text-gray-700 grid grid-cols-2 gap-x-3 gap-y-2">
          <dt class="text-gray-500">Table</dt><dd>{{ r.table }}</dd>
          <dt class="text-gray-500">Date</dt><dd>{{ r.date }}</dd>
          <dt class="text-gray-500">Time</dt><dd>{{ formatTime(r.time) }}</dd>
          <dt class="text-gray-500">Duration</dt><dd>{{ formatDuration(r.duration) }}</dd>
          <dt v-if="r.created_at" class="text-gray-500">Created</dt><dd v-if="r.created_at">{{ formatDate(r.created_at) }}</dd>
          <dt v-if="r.updated_at" class="text-gray-500">Updated</dt><dd v-if="r.updated_at">{{ formatDate(r.updated_at) }}</dd>
        </dl>
      </article>
    </div>

    <div v-else-if="!loading && !error" class="text-gray-500">No reservations yet.</div>

    <nav v-if="page.next || page.previous" class="mt-5 flex gap-2">
      <button class="btn" :disabled="!page.previous" @click="go(page.previous)">Prev</button>
      <button class="btn" :disabled="!page.next" @click="go(page.next)">Next</button>
    </nav>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api/http'

const items = ref([])
const page = ref({ next: null, previous: null })
const loading = ref(false)
const error = ref('')

const formatDate = (s) => (s ? new Date(s).toLocaleString() : '')
const formatTime = (t) => t ? String(t).slice(0, 5) : '—' // 'HH:MM'
const formatDuration = (d) => {
  if (!d && d !== 0) return '—'
  const minutes = Math.floor(Number(d) / 60) // если на бэке секунды — делим на 60
  if (Number.isNaN(minutes)) return String(d)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return `${h}h${m ? ' ' + m + 'm' : ''}`
}

async function fetchList (url = '/reservation/') {
  loading.value = true; error.value = ''
  try {
    const { data } = await http.get(url)
    if (Array.isArray(data)) {
      items.value = data
      page.value = { next: null, previous: null }
    } else {
      items.value = data.results ?? []
      page.value = { next: data.next ?? null, previous: data.previous ?? null }
    }
  } catch (e) {
    const resp = e?.response
    if (resp?.data?.detail) error.value = resp.data.detail
    else if (typeof resp?.data === 'string') error.value = resp.data
    else error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to load reservations')
  } finally {
    loading.value = false
  }
}

function go (url) {
  if (!url) return
  try { const u = new URL(url); fetchList(u.pathname + u.search) }
  catch { fetchList(url) }
}

onMounted(() => fetchList()) 
</script>