<template>
  <nav class="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
    <div class="container flex items-center gap-4 py-3">
      <b class="text-lg">Reservation UI</b>

      <router-link class="text-gray-700 hover:text-blue-600" to="/">Home</router-link>
      <router-link v-if="isAuth" class="text-gray-700 hover:text-blue-600" to="/reservations">Reservations</router-link>
      <router-link v-if="isAuth" class="text-gray-700 hover:text-blue-600" to="/tables">Tables</router-link>
      <router-link v-if="isAuth" class="text-gray-700 hover:text-blue-600" to="/me">Profile</router-link>

      <div class="ml-auto flex items-center gap-3">
        <router-link v-if="!isAuth" class="btn-ghost" to="/login">Login</router-link>
        <router-link v-if="!isAuth" class="btn" to="/register">Register</router-link>
        <button v-if="isAuth" class="btn" @click="logout">Logout</button>
      </div>
    </div>
  </nav>
</template>



<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const { isAuthenticated: isAuth } = storeToRefs(auth)
const router = useRouter()
const logout = () => { auth.clearAuth(); router.push({ name: 'home' }) }
</script>