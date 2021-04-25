import { PagedQuery, PagedResponse } from './paged';
import { UserStatus, UserRole } from 'src/includes/datas/enums';

export type User = {
  id: string;
  username: string;
  displayName: string;
  mobile?: string;
  email: string;
  status: UserStatus;
  createTime: Date;
};

export type UserWithRole = User & {
  userRole?: UserRole;
};

export type UserMetas = {
  nickName: string;
  firstName: string;
  lastName: string;
  description: string;
  role: UserRole;
  locale: string;
  [metaKey: string]: string;
};

export type UserCreationModel = {
  username: string;
  password: string;
  email: string;
  mobile?: string;
  url?: string;
  firstName?: string;
  lastName?: string;
  locale: string | null;
  userRole: UserRole;
  sendUserNotification: boolean;
};

export type UserUpdateModel = Partial<
  Pick<UserCreationModel, 'firstName' | 'lastName' | 'email' | 'mobile' | 'userRole' | 'locale' | 'password'>
> & {
  nickName: string;
  displayName: string;
  adminColor: string;
};

export type UserResponse = User & {
  metas: Array<{ key: string; value: string }>;
};

export type UserPagedQuery = PagedQuery<{
  keyword?: string;
  userRole?: UserRole;
}>;

export type UserPagedResponse = PagedResponse<
  UserWithRole & {
    metas: Array<{ key: string; value: string }>;
  }
>;
