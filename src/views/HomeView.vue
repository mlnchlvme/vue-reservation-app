<template>
  <section class="container">
    <!-- Hero -->
    <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 border border-blue-100">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
        Welcome to <span class="text-blue-600">Reservation UI</span>
      </h1>
      <p class="mt-3 text-gray-600 max-w-2xl">
        Book a table in a couple of clicks. Manage your reservations, confirm by email, and enjoy your visit.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <router-link to="/tables" class="btn">Browse tables</router-link>
        <router-link v-if="!isAuth" to="/login" class="btn-ghost">Sign in</router-link>
        <router-link v-if="!isAuth" to="/register" class="btn-ghost">Create account</router-link>
        <router-link v-else to="/me" class="btn-ghost">My profile</router-link>
      </div>
    </div>

    <!-- Highlights -->
    <div class="grid gap-4 md:grid-cols-3 mt-6">
      <article class="card">
        <div class="text-lg font-semibold">Fast booking</div>
        <p class="text-gray-600 mt-1 text-sm">Choose a table, pick date & time, and confirm via email.</p>
      </article>

      <article class="card">
        <div class="text-lg font-semibold">Live status</div>
        <p class="text-gray-600 mt-1 text-sm">See table details and current status in real time.</p>
      </article>

      <article class="card">
        <div class="text-lg font-semibold">Manage profile</div>
        <p class="text-gray-600 mt-1 text-sm">Update your name and phone number anytime.</p>
      </article>
    </div>

    <!-- Quick links -->
    <div class="mt-6 flex flex-wrap gap-3">
      <router-link to="/tables" class="btn">Find a table</router-link>
      <router-link to="/reservations/confirm/sample-token" class="btn-ghost">Confirm sample</router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isAuth = computed(() => !!auth.tokens?.access)
</script>
