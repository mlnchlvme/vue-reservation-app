import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'


// Lazy views
const Home = () => import('../views/HomeView.vue')
const Login = () => import('../views/auth/LoginView.vue')
const Register = () => import('../views/auth/RegisterView.vue')
const Me = () => import('../views/user/MeView.vue')


const Reservations = () => import('../views/reservations/ReservationsList.vue')
const ReservationDetail = () => import('../views/reservations/ReservationDetail.vue')
const CreateReservation = () => import('../views/reservations/CreateReservation.vue')


const Tables = () => import('../views/tables/TablesList.vue')
const TableDetail = () => import('../views/tables/TableDetail.vue')


const router = createRouter({
history: createWebHistory(),
routes: [
{ path: '/', name: 'home', component: Home },


{ path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
{ path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },


{ path: '/me', name: 'me', component: Me, meta: { requiresAuth: true } },


{ path: '/reservations', name: 'reservations', component: Reservations, meta: { requiresAuth: true } },
{ path: '/reservations/create', name: 'reservation-create', component: CreateReservation, meta: { requiresAuth: true } },
{ path: '/reservations/:id', name: 'reservation-detail', component: ReservationDetail, meta: { requiresAuth: true } },


{ path: '/tables', name: 'tables', component: Tables, meta: { requiresAuth: true } },
{ path: '/tables/:id', name: 'table-detail', component: TableDetail, meta: { requiresAuth: true } },


{ path: '/:pathMatch(.*)*', redirect: '/' }
]
})


router.beforeEach((to) => {
const auth = useAuthStore()
if (to.meta.requiresAuth && !auth.isAuthenticated) {
return { name: 'login', query: { next: to.fullPath } }
}
if (to.meta.guestOnly && auth.isAuthenticated) {
return { name: 'home' }
}
})


export default router