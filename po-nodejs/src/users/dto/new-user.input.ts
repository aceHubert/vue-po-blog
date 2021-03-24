import { Field, InputType } from '@nestjs/graphql';
import { Length, MinLength, IsEmail, IsUrl } from 'class-validator';
import { UserStatus, UserRole } from '@/common/helpers/enums';

@InputType({ description: '用户新建模型' })
export class NewUserInput {
  @Field({ description: '登录名' })
  loginName!: string;

  @Field({ description: '登录密码' })
  @MinLength(6, { message: '最小长度不得小于6位' })
  loginPwd!: string;

  @Field({ nullable: true, description: '昵称，不填则使用登录名' })
  niceName?: string;

  @Field({ nullable: true, description: '前台显示名称，不填则使用登录名' })
  displayName?: string;

  @Field({ nullable: true, description: '手机号码' })
  @Length(11, 11, { message: '手机号码长度为11位' })
  mobile?: string;

  @Field({ description: 'Email' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @Field({ description: '客户端 URL' })
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: 'Url 格式错误' })
  url!: string;

  @Field(() => UserStatus, { defaultValue: UserStatus.Enable, description: '状态' })
  status!: UserStatus;

  @Field(() => UserRole, { defaultValue: UserRole.Subscriber, description: '角色' })
  role!: UserRole;
}
