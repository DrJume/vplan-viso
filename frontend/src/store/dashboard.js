import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import axios from 'axios'

export default () => new Vuex.Store({
  state: {
    
  },
  mutations: {
    
  },
  actions: {
    // async fetchVplan({ commit, state }, { queue }) {
    //   const res = await axios.get(`/api/vplan/${state.display.type}/${queue}`)

    //   if (res.status === '200') {
    //     commit('SET_VPLAN', { queue }, res.data)
    //   }

    // },
    // async fetchTicker({ commit, state }) {
    //   const res = await axios.get(`/api/ticker/${state.display.type}`)

    //   if (res.status === '200') {
    //     commit('SET_TICKER', res.data)
    //   }

    // }
  }
})
