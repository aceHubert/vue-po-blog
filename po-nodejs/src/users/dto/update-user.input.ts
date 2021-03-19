import { Field, InputType } from '@nestjs/graphql';
import { Length, IsEmail } from 'class-validator';

@InputType({ description: '用户修改模型' })
export class UpdateUserInput {
  @Field({ nullable: true, description: '昵称' })
  niceName?: string;

  @Field({ nullable: true, description: '前台显示名称' })
  displayName?: string;

  @Field({ nullable: true, description: '手机号码' })
  @Length(11, 11, { message: '手机号码长度为11位' })
  mobile?: string;

  @Field({ nullable: true, description: 'Email' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;
}
