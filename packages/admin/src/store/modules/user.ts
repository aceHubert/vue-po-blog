import Vue from 'vue';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { welcome } from '@/utils/util';
import { loginApi, userApi } from '@/includes/datas';

// Types
import { Module } from 'vuex';
import { RootState } from '../';

export type UserState = {
  token: string;
  name: string;
  welcome: string;
  avatar: string;
  roles: string[];
  info: Dictionary<any>;
};

const user: Module<UserState, RootState> = {
  namespaced: true,
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name;
      state.welcome = welcome;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_INFO: (state, info) => {
      state.info = info;
    },
  },

  actions: {
    // 登录
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        loginApi
          .login(userInfo)
          .then((response) => {
            const { model } = response;
            commit('SET_TOKEN', model.token);
            Vue.ls.set(ACCESS_TOKEN, model.token, 7 * 24 * 60 * 60 * 1000);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    socialLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        loginApi
          .socialLogin(params)
          .then((response) => {
            const { model } = response;
            commit('SET_TOKEN', model.token);
            Vue.ls.set(ACCESS_TOKEN, model.token, 7 * 24 * 60 * 60 * 1000);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo({ commit }) {
      return new Promise((resolve, reject) => {
        userApi
          .getInfo()
          .then((response) => {
            const { model } = response;
            const { roles, name, avatar } = model;

            if (!roles || roles.length <= 0) {
              reject(new Error('getInfo: roles must be a non-null array!'));
            }

            commit('SET_INFO', model);
            commit('SET_ROLES', roles);
            commit('SET_AVATAR', avatar);

            commit('SET_NAME', { name: name, welcome: welcome() });
            commit('SET_AVATAR', avatar);

            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 登出
    logout({ commit }) {
      return new Promise((resolve) => {
        loginApi
          .logout()
          .then(() => {
            resolve();
          })
          .catch(() => {
            resolve();
          })
          .finally(() => {
            commit('SET_TOKEN', '');
            commit('SET_ROLES', []);
            Vue.ls.remove(ACCESS_TOKEN);
          });
      });
    },
  },
};

export default user;
