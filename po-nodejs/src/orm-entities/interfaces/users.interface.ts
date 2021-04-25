import { Optional } from './optional.interface';
import { UserStatus } from '@/users/enums';

export interface UserAttributes {
  id: number;
  loginName: string;
  loginPwd: string;
  niceName: string;
  displayName: string;
  mobile: string | null;
  email: string;
  url: string | null;
  status: UserStatus;
  updatedAt: Date;
  createdAt: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'niceName' | 'displayName' | 'mobile' | 'url' | 'status'> {}
