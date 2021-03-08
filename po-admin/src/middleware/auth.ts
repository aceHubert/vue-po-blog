import { userStore } from '@/store/modules';

// Types
import { Context } from '@nuxt/types';

// 匿名允许路由名
const isAnonymousRoute = (route: Context['route']) => {
  return (
    route.name === 'error' ||
    route.name === 'init' ||
    route.name?.startsWith('account-') || // login/logout/register/lost-password
    (route.meta && route.meta!.anonymous)
  );
};

export default async ({ route, redirect }: Context) => {
  // 没有授权，需要登录
  if (!isAnonymousRoute(route)) {
    if (!userStore.accessToken) {
      // 如果存在 refresh token, 会去获取一次 access token, 否则退出
      try {
        await userStore.refreshToken();
      } catch {
        redirect('/logout');
      }
    }

    if (!userStore.role) {
      redirect('/unauthorized');
    }
  }
};
