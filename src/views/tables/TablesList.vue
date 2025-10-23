<template>
  <section class="container">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Tables</h2>
      <button class="btn-ghost" @click="fetchList()">Reload</button>
    </div>

    <!-- состояния -->
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <pre v-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</pre>

    <!-- список -->
    <div v-if="!loading && !error && items.length"
         class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="t in items" :key="t.id" class="card">
        <header class="flex items-start justify-between">
          <div class="font-semibold">
            #{{ t.id }} <span v-if="t.name || t.code">— {{ t.name || t.code }}</span>
          </div>
          <router-link class="btn-ghost" :to="`/tables/${t.id}`">Open</router-link>
        </header>

        <dl class="mt-3 text-sm text-gray-700 grid grid-cols-2 gap-x-3 gap-y-2">
          <dt class="text-gray-500">Type</dt><dd>{{ t.type ?? '—' }}</dd>
          <dt class="text-gray-500">Status</dt>
          <dd>
            <span class="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="t.status === 'busy' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ t.status ?? '—' }}
            </span>
          </dd>
          <dt class="text-gray-500">Capacity</dt><dd>{{ t.seats ?? '—' }}</dd>
          <dt v-if="t.created_at" class="text-gray-500">Created</dt><dd v-if="t.created_at">{{ formatDate(t.created_at) }}</dd>
          <dt v-if="t.updated_at" class="text-gray-500">Updated</dt><dd v-if="t.updated_at">{{ formatDate(t.updated_at) }}</dd>
        </dl>
      </article>
    </div>

    <!-- пусто -->
    <div v-if="!loading && !error && !items.length" class="text-gray-500">
      No tables yet.
    </div>

    <!-- пагинация DRF -->
    <nav v-if="page.next || page.previous" class="mt-5 flex gap-2">
      <button class="btn" :disabled="!page.previous" @click="go(page.previous)">Prev</button>
      <button class="btn" :disabled="!page.next" @click="go(page.next)">Next</button>
    </nav>

    <!-- быстрый дебаг (временно раскомментируй при необходимости) -->
    <!-- <pre class="mt-4 text-xs">{{ raw }}</pre> -->
  </section>
</template>




<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api/http'

const items = ref([])
const page = ref({ next: null, previous: null })
const loading = ref(false)
const error = ref('')
const raw = ref(null) // для временного дебага

const formatDate = (s) => (s ? new Date(s).toLocaleString() : '')

async function fetchList(url = '/tables/') {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.get(url)
    raw.value = data // см. блок дебага в шаблоне

    // поддержка и массива, и стандартного пагинированного ответа DRF
    if (Array.isArray(data)) {
      items.value = data
      page.value = { next: null, previous: null }
    } else if (data && typeof data === 'object') {
      items.value = data.results ?? []
      page.value = { next: data.next ?? null, previous: data.previous ?? null }
    } else {
      // неожиданный формат — покажем как есть
      items.value = []
      error.value = 'Unexpected response format from /tables/'
    }
  } catch (e) {
    // выведем понятную ошибку
    const resp = e?.response
    if (resp?.data?.detail) error.value = resp.data.detail
    else if (typeof resp?.data === 'string') error.value = resp.data
    else error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to load tables')
  } finally {
    loading.value = false
  }
}

// поддержка абсолютных ссылок в DRF (next/previous)
function go(url) {
  if (!url) return
  try {
    const u = new URL(url)
    fetchList(u.pathname + u.search)
  } catch {
    fetchList(url)
  }
}

onMounted(() => fetchList()) 
</script>