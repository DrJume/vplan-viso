import Vue from 'vue'
import Vuex from 'vuex'

// import axios from 'axios'

import wsSyncPlugin from './plugins/wsSyncPlugin'

Vue.use(Vuex)

export default () => new Vuex.Store({
  plugins: [wsSyncPlugin],
  state: {
    display: {
      target: '',
      vplan: {
        current: {
          data: {},
          paging: {
            activePage: 0,
            pageChunks: [],
          },
          status: '',
        },
        next: {
          data: {},
          paging: {
            activePage: 0,
            pageChunks: [],
          },
          status: '',
        },
      },
      ticker: '',
    },
  },
  mutations: {
    SET_DISPLAY_TARGET(state, target) {
      state.display.target = target
    },
    SET_STATUS(state, { queue, status }) {
      state.display.vplan[queue].status = status
    },
    SET_VPLAN(state, { queue, vplan }) {
      state.display.vplan[queue].data = vplan
    },
    SET_VPLAN_PAGE(state, { queue, pageNr }) {
      state.display.vplan[queue].paging.activePage = pageNr
    },
    SET_VPLAN_PAGECHUNKS(state, { queue, pageChunks }) {
      state.display.vplan[queue].paging.pageChunks = pageChunks
    },
    SET_TICKER(state, tickerTxt) {
      state.display.ticker = tickerTxt
    },
  },
  actions: {
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
