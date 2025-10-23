<template>
  <section class="container max-w-md">
    <h2 class="text-2xl font-semibold mb-4">Login</h2>

    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="label">Email</label>
        <input v-model.trim="email" type="email" class="input" required />
      </div>

      <div>
        <label class="label">Password</label>
        <div class="relative">
        <input
            :type="showPass ? 'text' : 'password'"
            v-model.trim="password"
            class="input pr-12 w-full"
            required
        />
        <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
            @click="showPass = !showPass"
        >
            {{ showPass ? 'Hide' : 'Show' }}
        </button>
        </div>
      </div>

      <button class="btn w-full" :disabled="loading">Sign in</button>
    </form>

    <pre v-if="error" class="mt-3 text-red-700 whitespace-pre-wrap">{{ error }}</pre>
  </section>
</template>



<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import http from '../../api/http'
import { useAuthStore } from '../../stores/auth'


const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()


const submit = async () => {
loading.value = true; error.value = ''
try {
const { data } = await http.post('/users/login/', { email: email.value, password: password.value })
// Ожидаем TokenPair {access, refresh}
auth.setTokens({ access: data.access, refresh: data.refresh })
router.replace(route.query.next ? String(route.query.next) : '/')
} catch (e) {
error.value = e.response?.data?.detail || 'Login failed'
} finally {
loading.value = false
}
}
</script>