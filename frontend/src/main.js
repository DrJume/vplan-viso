import Vue from 'vue'
import App from './App.vue'
import router from './router'

import VueObserveVisibility from 'vue-observe-visibility'
Vue.use(VueObserveVisibility)

import 'bootstrap/dist/css/bootstrap.min.css'

import Octicon from './components/Util/Octicon.vue'
Vue.component('octicon', Octicon)

Vue.config.productionTip = false

new Vue({
  router,
  // using multiple stores, each injected into view components
  render: h => h(App)
}).$mount('#app')
