import { Optional } from './optional.interface';
import { UserStatus } from '@/common/helpers/enums';

export { UserStatus };

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
