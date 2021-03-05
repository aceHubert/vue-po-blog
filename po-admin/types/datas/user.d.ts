import { PagerQuery, PagerResponse } from './pager';
import { UserStatus, UserRole } from 'src/includes/datas/enums';

export type User = {
  id: number;
  loginName: string;
  displayName: string;
  mobile?: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  createTime: Date;
} & {
  // from metas
  nickName: string;
  firstName: string;
  lastName: string;
  [metaKey: string]: string;
};

export type UserPagerQuery = PagerQuery<{
  keywords?: string;
  role?: UserRole;
}>;

export type UserPagerResponse = PagerResponse<{
  id: number;
  loginName: string;
  displayName: string;
  mobile?: string;
  email: string;
  status: UserStatus;
  createTime: Date;
  metas: Array<{ key: string; value: string }>;
}>;
