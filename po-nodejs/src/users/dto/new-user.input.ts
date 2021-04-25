import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length, MinLength, IsEmail, IsUrl } from 'class-validator';
import { UserStatus, UserRole } from '@/common/helpers/enums';

@InputType({ description: '用户新建模型' })
export class NewUserInput {
  @Field({ description: '登录名' })
  loginName!: string;

  @Field({ description: '登录密码' })
  @MinLength(6, { message: '最小长度不得小于6位' })
  loginPwd!: string;

  @Field({ description: 'Email' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @Field({ nullable: true, description: '手机号码' })
  @IsOptional()
  @Length(11, 11, { message: '手机号码长度为11位' })
  mobile?: string;

  @Field({ nullable: true, description: '名' })
  firstName?: string;

  @Field({ nullable: true, description: '姓' })
  lastName?: string;

  @Field({ nullable: true, description: '客户端 URL' })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: 'Url 格式错误' })
  url?: string;

  @Field(() => UserStatus, { defaultValue: UserStatus.Enable, description: '状态' })
  status!: UserStatus;

  @Field(() => UserRole, { defaultValue: UserRole.Subscriber, description: '角色' })
  userRole!: UserRole;

  @Field({ nullable: true, description: '语言' })
  locale?: string;

  @Field(() => Boolean, { defaultValue: true, description: '发送账号信息到用户邮箱' })
  sendUserNotification!: boolean;
}
