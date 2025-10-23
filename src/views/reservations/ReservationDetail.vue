<template>
  <section class="container">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Reservation #{{ id }}</h2>
      <div class="flex gap-2">
        <button class="btn-ghost" @click="load">Reload</button>
        <button class="btn" @click="cancel" :disabled="working">Cancel</button>
        <button class="btn bg-red-600 hover:bg-red-700" @click="remove" :disabled="working">Delete</button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <pre v-if="msg" class="whitespace-pre-wrap">{{ msg }}</pre>
    <pre v-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</pre>

    <article v-if="item" class="card">
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div><span class="text-gray-500">Table</span><div class="font-medium">{{ item.table }}</div></div>
        <div><span class="text-gray-500">Date</span><div class="font-medium">{{ item.date }}</div></div>
        <div><span class="text-gray-500">Time</span><div class="font-medium">{{ formatTime(item.time) }}</div></div>
        <div><span class="text-gray-500">Duration</span><div class="font-medium">{{ formatDuration(item.duration) }}</div></div>
        <div v-if="item.created_at"><span class="text-gray-500">Created</span><div class="font-medium">{{ formatDate(item.created_at) }}</div></div>
        <div v-if="item.updated_at"><span class="text-gray-500">Updated</span><div class="font-medium">{{ formatDate(item.updated_at) }}</div></div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../api/http'

const route = useRoute(); const router = useRouter()
const id = computed(() => route.params.id)

const item = ref(null)
const msg = ref('')
const error = ref('')
const loading = ref(false)
const working = ref(false)

const formatDate = (s) => (s ? new Date(s).toLocaleString() : '')
const formatTime = (t) => t ? String(t).slice(0, 5) : '—'
const formatDuration = (d) => {
  if (!d && d !== 0) return '—'
  const minutes = Math.floor(Number(d) / 60) // если секунды -> в минуты
  if (Number.isNaN(minutes)) return String(d)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return `${h}h${m ? ' ' + m + 'm' : ''}`
}

async function load () {
  loading.value = true; error.value = ''; msg.value = ''
  try {
    const { data } = await http.get(`/reservation/${id.value}/`)
    item.value = data
  } catch (e) {
    const resp = e?.response
    if (resp?.data?.detail) error.value = resp.data.detail
    else if (typeof resp?.data === 'string') error.value = resp.data
    else error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to load reservation')
  } finally {
    loading.value = false
  }
}

async function cancel () {
  working.value = true; error.value = ''; msg.value = ''
  try {
    await http.post(`/reservation/${id.value}/cancel/`)
    msg.value = 'Reservation cancelled'
    await load()
  } catch (e) {
    const resp = e?.response
    if (resp?.data?.detail) error.value = resp.data.detail
    else if (typeof resp?.data === 'string') error.value = resp.data
    else error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to cancel')
  } finally {
    working.value = false
  }
}

async function remove () {
  working.value = true; error.value = ''; msg.value = ''
  try {
    await http.delete(`/reservation/${id.value}/`)
    router.push('/reservations')
  } catch (e) {
    const resp = e?.response
    if (resp?.data?.detail) error.value = resp.data.detail
    else if (typeof resp?.data === 'string') error.value = resp.data
    else error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to delete')
  } finally {
    working.value = false
  }
}

onMounted(load)
</script>
