<template>
<section style="padding:16px;max-width:520px">
<h2>Create reservation</h2>
<form @submit.prevent="submit">
<!-- Поля меняй под свою схему ReservationCreate из Swagger -->
<label>Table ID</label>
<input v-model.number="payload.table" type="number" required />


<label>When (ISO)</label>
<input v-model="payload.datetime" placeholder="2025-10-22T19:00:00Z" />


<label>Guests</label>
<input v-model.number="payload.guests" type="number" />


<button>Create</button>
</form>
<p v-if="msg">{{ msg }}</p>
</section>
</template>


<script setup>
import { reactive } from 'vue'
import http from '../../api/http'


const payload = reactive({ table: null, datetime: '', guests: 2 })
const msg = ref('')


async function submit(){
await http.post('/reservation/', payload)
msg.value = 'Created — check the list'
}
</script>