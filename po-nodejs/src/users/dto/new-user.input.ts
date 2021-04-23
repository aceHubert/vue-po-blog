import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MinLength, IsEmail, IsUrl, IsMobilePhone } from 'class-validator';
import { UserRole, UserStatus } from '../enums';

@InputType({ description: 'New user input' })
export class NewUserInput {
  @Field({ description: 'Login name' })
  loginName!: string;

  @MinLength(6, { message: 'field $property must be longer than or equal to $constraint1 characters' })
  @Field({ description: 'Login password' })
  loginPwd!: string;

  @IsEmail({}, { message: 'field $property must be an email' })
  @Field({ description: 'Email' })
  email!: string;

  @IsOptional()
  @IsMobilePhone('any' as any, {}, { message: 'field $property must be a mobile number' })
  @Field({ nullable: true, description: 'Mobile number' })
  mobile?: string;

  @Field({ nullable: true, description: 'First name' })
  firstName?: string;

  @Field({ nullable: true, description: 'Last name' })
  lastName?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: 'field $property must be an URL address' })
  @Field({ nullable: true, description: 'Home URL address' })
  url?: string;

  @Field(() => UserStatus, { defaultValue: UserStatus.Enable, description: 'User status' })
  status!: UserStatus;

  @Field(() => UserRole, { defaultValue: UserRole.Subscriber, description: 'User role' })
  userRole!: UserRole;

  @Field({ nullable: true, description: 'User language' })
  locale?: string;

  @Field(() => Boolean, { defaultValue: true, description: "Send account infomations to user's email" })
  sendUserNotification!: boolean;
}
