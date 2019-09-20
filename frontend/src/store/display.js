import Vue from 'vue'
import Vuex from 'vuex'

// import axios from 'axios'

import wsSyncPlugin from './plugins/wsSyncPlugin'

Vue.use(Vuex)

export default () => new Vuex.Store({
  plugins: [wsSyncPlugin.inject],
  state: {
    display: {
      vplan: {
        current: {
          data: {},
          pageChunks: [],
          status: '',
        },
        next: {
          data: {},
          pageChunks: [],
          status: '',
        },
      },
      ticker: '',
    },
  },
  mutations: {
    SET_STATUS(state, { queue, status }) {
      state.display.vplan[queue].status = status
    },
    SET_VPLAN_PAGECHUNKS(state, { queue, pageChunks }) {
      state.display.vplan[queue].pageChunks = pageChunks
    },
    SET_TICKER(state, tickerTxt) {
      state.display.ticker = tickerTxt
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    wsConnect({ commit, state }, target) {
      wsSyncPlugin.connect(target)
    },
    setVPlan({ commit, state }, { queue, vplan }) {
      state.display.vplan[queue].data = vplan
      commit('SET_STATUS', { queue, status: 'ADJUST_HEADER' })
    },
    // async fetchVPlan({ commit, state }, { queue }) {
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
  },
})
