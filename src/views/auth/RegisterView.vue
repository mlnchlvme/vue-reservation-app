<template>
  <section class="container max-w-xl">
    <h2 class="text-2xl font-semibold mb-4">Create account</h2>

    <form class="space-y-3" @submit.prevent="submit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="label">First name</label>
          <input v-model.trim="first_name" type="text" class="input" required />
        </div>
        <div>
          <label class="label">Last name</label>
          <input v-model.trim="last_name" type="text" class="input" required />
        </div>
      </div>

      <div>
        <label class="label">Email</label>
        <input v-model.trim="email" type="email" class="input" required />
      </div>

      <div>
        <label class="label">Phone</label>
        <input v-model.trim="phone" type="tel" class="input" placeholder="+7XXXXXXXXXX" required />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="label">Password</label>
          <input :type="showPass ? 'text' : 'password'" v-model.trim="password" class="input" required />
        </div>
        <div>
          <label class="label">Confirm password</label>
          <input :type="showPass ? 'text' : 'password'" v-model.trim="confirm_password" class="input" required />
        </div>
      </div>

      <div class="text-sm text-gray-600">
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="showPass" />
          <span>Show passwords</span>
        </label>
      </div>

      <button class="btn w-full" :disabled="loading">Create account</button>
    </form>

    <pre v-if="msg" class="mt-3 whitespace-pre-wrap">{{ msg }}</pre>
    <pre v-if="error" class="mt-3 text-red-700 whitespace-pre-wrap">{{ error }}</pre>
  </section>
</template>


<script setup>
import { ref } from 'vue'
import http from '../../api/http'

const first_name = ref('')
const last_name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirm_password = ref('')
const showPass = ref(false)

const loading = ref(false)
const msg = ref('')
const error = ref('')

async function submit () {
  loading.value = true
  msg.value = ''
  error.value = ''

  if (password.value !== confirm_password.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  const payload = {
    first_name: first_name.value,
    last_name: last_name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    confirm_password: confirm_password.value
  }

  try {
    await http.post('/users/register/', payload, { headers: { 'Content-Type': 'application/json' } })
    msg.value = 'Registered! Check your email for the verification link.'
    first_name.value = last_name.value = email.value = phone.value = password.value = confirm_password.value = ''
  } catch (e) {
      const resp = e?.response
      if (resp?.data && typeof resp.data === 'object') {
        const toArr = (x) => (Array.isArray(x) ? x : [x])
        error.value = Object.entries(resp.data)
          .map(([k, v]) => `${k}: ${toArr(v).map(String).join('; ')}`)
          .join('\n')
      } else if (typeof resp?.data === 'string') {
          error.value = resp.data
        } else {
          error.value = resp
            ? `${resp.status} ${resp.statusText || ''}`
            : (e?.message || 'Registration failed')
        }
    }
}
</script>

