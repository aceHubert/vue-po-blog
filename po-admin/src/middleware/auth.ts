import { userStore } from '@/store/modules';

// Types
import { Context } from '@nuxt/types';
import { UserCapability } from '@/includes/datas';

// 匿名允许路由名
const isAnonymousRoute = (route: Context['route']) => {
  return route.meta && route.meta!.some((item: Dictionary<any>) => item.anonymous);
};

// 页面是否有访问能力
const hasCapability = (route: Context['route'], userCapabilities: UserCapability[]) => {
  if (route.meta && route.meta!.some((item: Dictionary<any>) => item.capabilities)) {
    const pageCapabilities: UserCapability[] = [];
    route.meta!.forEach((item: Dictionary<any>) => {
      if (item.capabilities && Array.isArray(item.capabilities)) {
        item.capabilities.forEach((capability) => {
          !pageCapabilities.includes(capability) && pageCapabilities.push(capability);
        });
      }
    });
    return userCapabilities.some((capability) => pageCapabilities.includes(capability));
  }
  return true;
};

export default async ({ route, redirect, error, $i18n }: Context) => {
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

    // 在登录时判断角色
    if (!userStore.role) {
      redirect('/unauthorized');
    } else if (!hasCapability(route, userStore.capabilities)) {
      error({
        statusCode: 401,
        message: $i18n.tv('core.error.no_capability', 'No capabilities to operate this page!') as string,
      });
    }
  }
};
