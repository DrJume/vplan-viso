import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Display from './views/Display.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/display/students', component: Display, props: { target: 'students' } },
    { path: '/display/teachers', component: Display, props: { target: 'teachers' } },
    { path: '/api/*' },
    { path: '*', redirect: '/' },
  ],
})
