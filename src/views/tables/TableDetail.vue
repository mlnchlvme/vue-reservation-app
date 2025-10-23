<template>
  <section class="container">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Table #{{ id }}</h2>
      
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <pre v-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</pre>

    <article v-if="item" class="card">
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Name/Code</div>
          <div class="font-medium">{{ item.number || item.code || '—' }}</div>
        </div>

        <div>
          <div class="text-gray-500">Type</div>
          <div class="font-medium">{{ item.type ?? '—' }}</div>
        </div>

        <div>
          <div class="text-gray-500">Status</div>
          <div>
            <span
              class="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
              :class="item.status === 'busy' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
            >
              {{ item.status ?? '—' }}
            </span>
          </div>
        </div>

        <div>
          <div class="text-gray-500">Capacity</div>
          <div class="font-medium">{{ item.seats ?? '—' }}</div>
        </div>

        <div v-if="item.created_at">
          <div class="text-gray-500">Created</div>
          <div class="font-medium">{{ formatDate(item.created_at) }}</div>
        </div>

        <div v-if="item.updated_at">
          <div class="text-gray-500">Updated</div>
          <div class="font-medium">{{ formatDate(item.updated_at) }}</div>
        </div>
      </div>
    </article>

<!-- Booking form -->
    <article v-if="showBooking" class="card mt-4 max-w-xl">
        <h3 class="text-lg font-semibold mb-3">Book this table</h3>

        <form class="space-y-4" @submit.prevent="submitBooking">
            <div class="grid sm:grid-cols-2 gap-3">
                <div>
                    <label class="label">Date</label>
                    <input v-model="booking.date" type="date" class="input" required />
                </div>
                <div>
                    <label class="label">Time</label>
                    <input v-model="booking.time" type="time" class="input" required />
                </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
                <div>
                <label class="label">Duration</label>
                <select v-model.number="booking.duration" class="input">
                    <option :value="30">30 min</option>
                    <option :value="60">60 min</option>
                    <option :value="90">90 min</option>
                    <option :value="120">120 min</option>
                </select>
                </div>
            </div>

            <div class="flex gap-2 pt-1">
                <button class="btn" type="submit" :disabled="booking.saving">Confirm booking</button>
                <button class="btn-ghost" type="button" @click="cancelBooking" :disabled="booking.saving">Cancel</button>
            </div>

            <article v-if="booking.msg" class="card border-green-200 mt-2">
                <div class="text-green-700">
                {{ booking.msg }}
                <div class="text-sm text-gray-600 mt-1">
                    Please check your email and click the confirmation link.
                </div>
                </div>
            </article>
            <pre v-if="booking.error" class="mt-2 text-red-700 whitespace-pre-wrap">{{ booking.error }}</pre>
        </form>


    </article>


    <span padding class="flex justify-end mt-4">
        <div class="flex gap-2">
            <button class="btn" @click="toggleBooking" :disabled="booking.saving">Book</button>
        </div>

    </span>
    
  </section>
</template>



<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api/http'

const route = useRoute()
const id = computed(() => route.params.id)
const item = ref(null)

const formatDate = (s) => (s ? new Date(s).toLocaleString() : '')

onMounted(load)

// UI состояние формы
const showBooking = ref(false)
// состояние формы бронирования (ровно поля из Swagger)
const booking = reactive({
  date: '',
  time: '',        // HTML time даст 'HH:MM' — ниже нормализуем до 'HH:MM:00'
  duration: 60,    // по умолчанию 60 (единицы см. в бэке)
  saving: false,
  msg: '',
  error: ''
})

// нормализуем 'HH:MM' -> 'HH:MM:SS'
const normalizeTime = (t) => {
  if (!t) return ''
  // t может быть 'HH:MM' или 'HH:MM:SS'
  return t.length === 5 ? `${t}:00` : t
}



function toggleBooking () {
  booking.msg = ''
  booking.error = ''
  showBooking.value = !showBooking.value
}

function cancelBooking () {
  booking.msg = ''
  booking.error = ''
  showBooking.value = false
}

async function submitBooking () {
  booking.saving = true
  booking.msg = ''
  booking.error = ''
  try {
    if (!booking.date || !booking.time) {
      booking.error = 'Please choose date & time'
      return
    }

    const payload = {
      table: Number(id.value),
      date: booking.date,                  
      time: normalizeTime(booking.time),   
      duration: booking.duration * 60        
    }

    await http.post('/reservation/', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    booking.msg = 'Reservation created ✅ — pending email confirmation'
    showBooking.value = false
    await load()
  } catch (e) {
    const resp = e?.response
    if (resp?.data && typeof resp.data === 'object') {
      booking.error = Object.entries(resp.data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('; ') : String(v)}`)
        .join('\n')
    } else if (typeof resp?.data === 'string') {
      booking.error = resp.data
    } else {
      booking.error = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to create reservation')
    }
  } finally {
    booking.saving = false
  }
}



async function load() {
  const { data } = await http.get(`/tables/${id.value}/`)
  item.value = data
}
</script>
