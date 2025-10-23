<template>
  <section class="container max-w-3xl">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">My profile</h2>
        <div class="flex gap-2">
            <button class="btn-ghost" @click="load">Reload</button>
            <button v-if="!editMode" class="btn" @click="startEdit">Edit</button>
            <div v-else class="flex gap-2">
                <button class="btn" @click="saveEdit" :disabled="saving">Save</button>
                <button class="btn-ghost" @click="cancelEdit" :disabled="saving">Cancel</button>
            </div>
        </div>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <pre v-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</pre>

    <article v-if="me" class="card">
      <!-- header с аватаром -->
      <div class="flex items-center gap-4 mb-4">
        <div class="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
          {{ initials }}
        </div>
        <div>
          <div class="text-lg font-semibold">{{ displayName }}</div>
          <div class="text-gray-600 text-sm">{{ me.email }}</div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <span
            class="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
            :class="me.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
          >
            {{ me.is_verified ? 'Verified' : 'Not verified' }}
          </span>
          
        </div>
      </div>

      <!-- основные поля -->
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-gray-500">First name</div>
          <div class="font-medium">{{ me.first_name || '—' }}</div>
        </div>
        <div>
          <div class="text-gray-500">Last name</div>
          <div class="font-medium">{{ me.last_name || '—' }}</div>
        </div>

        <div>
          <div class="text-gray-500">Phone</div>
          <div class="font-medium">{{ me.phone || '—' }}</div>
        </div>

      </div>
    </article>

    <article v-if="editMode" class="card mt-4 max-w-3xl">
        <h3 class="text-lg font-semibold mb-3">Edit profile</h3>
        <form class="space-y-3" @submit.prevent="saveEdit">
            <div>
                <label class="label">First name</label>
                <input v-model.trim="form.first_name" class="input" type="text" />
            </div>
            <div>
                <label class="label">Last name</label>
                <input v-model.trim="form.last_name" class="input" type="text" />
            </div>
                <div>
                <label class="label">Phone</label>
                <input v-model.trim="form.phone" class="input" type="tel" placeholder="+7XXXXXXXXXX" />
            </div>
            <div>
                <label class="label">Email</label>
                <input :value="me.email" class="input opacity-70 pointer-events-none" disabled />
            </div>
            <div>
                <label class="label">New password (optional)</label>
                <input v-model.trim="form.password" class="input" type="password" placeholder="Leave empty to keep current" />
            </div>


            <div class="flex gap-2 pt-2">
                <button class="btn" type="submit" :disabled="saving">Save</button>
                <button class="btn-ghost" type="button" @click="cancelEdit" :disabled="saving">Cancel</button>
            </div>

            <pre v-if="editError" class="mt-3 text-red-700 whitespace-pre-wrap">{{ editError }}</pre>
        </form>
    </article>
  </section>
</template>



<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import http from '../../api/http'

const me = ref(null)
const loading = ref(false)
const error = ref('')

const displayName = computed(() =>
  (me.value?.first_name || me.value?.last_name)
    ? `${me.value.first_name || ''} ${me.value.last_name || ''}`.trim()
    : (me.value?.email || 'User')
)

const initials = computed(() => {
  const a = (me.value?.first_name || '').charAt(0)
  const b = (me.value?.last_name || '').charAt(0)
  const base = (a + b).toUpperCase()
  return base || (me.value?.email?.charAt(0)?.toUpperCase() || '?')
})

const editMode = ref(false)
const saving = ref(false)
const editError = ref('')

const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  password: ''    
})


function startEdit () {
  editError.value = ''
  form.first_name = me.value?.first_name || ''
  form.last_name  = me.value?.last_name  || ''
  form.phone      = me.value?.phone      || ''
  form.password   = ''            
  editMode.value = true
}


function cancelEdit () {
  editError.value = ''
  editMode.value = false
}

async function saveEdit () {
  saving.value = true
  editError.value = ''
  try {
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone
    }
    if (form.password) payload.password = form.password

    const { data } = await http.patch('/users/update_me/', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    me.value = data 
    form.password = '' 
    editMode.value = false
  } catch (e) {
    const resp = e?.response
    if (resp?.data && typeof resp.data === 'object') {
      const lines = []
      for (const [k, v] of Object.entries(resp.data)) {
        const arr = Array.isArray(v) ? v : [String(v)]
        lines.push(`${k}: ${arr.join('; ')}`)
      }
      editError.value = lines.join('\n')
    } else if (typeof resp?.data === 'string') {
      editError.value = resp.data
    } else {
      editError.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to save')
    }
  } finally {
    saving.value = false
  }
}


async function load () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.get('/users/me/')
    me.value = data
  } catch (e) {
    const resp = e?.response
    if (resp?.data && typeof resp.data === 'object' && resp.data.detail) {
      error.value = resp.data.detail
    } else if (typeof resp?.data === 'string') {
      error.value = resp.data
    } else {
      error.value = resp ? `${resp.status} ${resp.statusText || ''}` : (e?.message || 'Failed to load profile')
    }
    console.error('ME_LOAD_ERROR:', e)
  } finally {
    loading.value = false
  }
}

onMounted(load) 
</script>
