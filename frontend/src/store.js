import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vplan: {
        type: '',
        current: {
          data: {},
          display: {
            activePage: 0,
            pageLengths: []
          }
        },
        next: {
          data: {},
          display: {
            activePage: 0,
            pageLengths: []
          }
        },
        ticker: ''
    }
  },
  mutations: {
    UPDATE_VPLAN(state, { queue, vplan}) {
      state.vplan[queue].data = vplan
      state.vplan.type = vplan.type
    },
    SET_VPLAN_PAGE(state, { queue, pageNr }){
      state.vplan[queue].display.activePage = pageNr
    },
    SET_VPLAN_PAGELENGTHS(state, { queue, pageLengths } ) {
      state.vplan[queue].display.pageLengths = pageLengths
    },
    UPDATE_TICKER(state, payload) {
      state.vplan.ticker = payload
    }
  },
  actions: {
    async fetchVplan({commit, state}, {type, queue}) {
      const res = await axios.get(`/api/vplan/${type}/${queue}`)

      if (res.status === '200') {
        commit('UPDATE_VPLAN', {queue}, res.data)
      }

    },
    async fetchTicker({ commit, state },) {
      const res = await axios.get(`/api/ticker/${state.vplan.ticker}`)

      if (res.status === '200') {
        commit('UPDATE_TICKER', res.data)
      }

    }
  }
})
