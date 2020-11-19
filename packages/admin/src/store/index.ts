import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import app from './modules/app';
import user from './modules/user';

// default router permission control
// import permission from './modules/permission';

// dynamic router permission control (Experimental)
// import permission from './modules/async-router'
import state, { RootState } from './state';
import getters from './getters';

Vue.use(Vuex);

export const store = new Vuex.Store<RootState>({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    app,
    user,
  },
  state,
  getters,
  mutations: {},
  actions: {},
});

const createStore = (): Store<RootState> => {
  return store;
};

export default createStore;
