/**
 * controller/Fields 角色权限验证
 * 通过 @Authorized([...roles]) 构造器添加验证
 */
import { AuthChecker } from 'type-graphql';

export const authChecker: AuthChecker<ContextType> = async ({ context }, roles) => {
  if (!context.token) {
    return false;
  }

  // 验证token expired
  try {
    await context.authHelper.verifyToken(context.token);
  } catch {
    return false;
  }

  // 用户不在在或没有角色
  if (!context.user || !context.user.role) {
    return false;
  }

  if (roles.length) {
    return roles.includes(context.user.role);
  }

  return true;
};
