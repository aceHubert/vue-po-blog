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
  url: string;
  status: UserStatus;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'niceName' | 'displayName' | 'mobile' | 'status'> {}
