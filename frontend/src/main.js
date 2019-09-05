import Vue from 'vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import VueObserveVisibility from 'vue-observe-visibility'
import Octicon from './components/Util/Octicon.vue'

import App from './App.vue'
import router from './router'

Vue.use(VueObserveVisibility)
Vue.component('octicon', Octicon)

Vue.config.productionTip = false

new Vue({
  router,
  // using multiple stores, each injected into view components
  render: h => h(App),
}).$mount('#app')
