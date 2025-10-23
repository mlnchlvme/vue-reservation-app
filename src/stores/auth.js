import { defineStore } from 'pinia'


export const useAuthStore = defineStore('auth', {
state: () => ({
access: localStorage.getItem('access') || null,
refresh: localStorage.getItem('refresh') || null,
user: null
}),
getters: {
isAuthenticated: (s) => !!s.access
},
actions: {
setTokens({ access, refresh }) {
this.access = access
this.refresh = refresh
localStorage.setItem('access', access)
localStorage.setItem('refresh', refresh)
},
clearAuth() {
this.access = null
this.refresh = null
this.user = null
localStorage.removeItem('access')
localStorage.removeItem('refresh')
}
}
})