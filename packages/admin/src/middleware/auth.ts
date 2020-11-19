import Vue from 'vue';
import { ACCESS_TOKEN } from '@/config/proLayoutConfigs';

// Types
import { Context } from '@nuxt/types';

// 匿名允许路由名
const anonymousRouteNames = ['login'];

export default ({ route, redirect }: Context) => {
  const hasLogin = !!Vue.ls.get(ACCESS_TOKEN);
  // 没有授权，需要登录
  if (!anonymousRouteNames.includes(route.name!) && !hasLogin) {
    redirect({ name: 'login' });
  }
};
