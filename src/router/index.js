import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PortfolioView from '../views/PortfolioView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import CryptoDetailView from '../views/CryptoDetailView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: PortfolioView
  },
  {
    path: '/favoritas',
    name: 'favoritas',
    component: FavoritesView
  },
  {
    path: '/moneda/:id',
    name: 'crypto-detail',
    component: CryptoDetailView
  },
  {
    path: '/perfil',
    name: 'profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.path === '/portfolio' && !isAuthenticated) {
    next('/perfil');
  } else {
    next();
  }
});

export default router
