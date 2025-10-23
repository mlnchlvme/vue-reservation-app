import axios from 'axios'
import { useAuthStore } from '../stores/auth'


const http = axios.create({
baseURL: import.meta.env.VITE_API_BASE || '/api',
withCredentials: false
})


// Добавляем access‑токен
http.interceptors.request.use((config) => {
const auth = useAuthStore()
if (auth.access) {
config.headers.Authorization = `Bearer ${auth.access}`
}
return config
})


// Обновление токена по 401
let isRefreshing = false
let queue = []


http.interceptors.response.use(
(r) => r,
async (error) => {
const auth = useAuthStore()
const original = error.config


if (error.response?.status === 401 && auth.refresh && !original._retry) {
if (isRefreshing) {
return new Promise((resolve) => queue.push((token) => {
original.headers.Authorization = `Bearer ${token}`
resolve(http(original))
}))
}
original._retry = true
isRefreshing = true
try {
const { data } = await axios.post(
`${import.meta.env.VITE_API_BASE || '/api'}/users/login/refresh/`,
{ refresh: auth.refresh }
)
auth.setTokens({ access: data.access, refresh: auth.refresh })
queue.forEach((cb) => cb(data.access))
queue = []
return http(original)
} catch (e) {
auth.clearAuth()
return Promise.reject(e)
} finally {
isRefreshing = false
}
}
return Promise.reject(error)
}
)


export default http