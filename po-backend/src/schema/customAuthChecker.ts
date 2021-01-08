import { AuthChecker } from 'type-graphql';

export const customAuthChecker: AuthChecker<ContextType> = ({ context }, roles) => {
  if (!context.user) {
    return false;
  }

  if (roles.length) {
    return roles.includes(context.user.role);
  }

  return true;
};
