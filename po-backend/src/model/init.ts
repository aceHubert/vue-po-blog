import { Field, ArgsType } from 'type-graphql';
import { Length } from 'class-validator';

@ArgsType()
export class GetInitArgs {
  @Field({ description: '博客标题' })
  title!: string;

  @Field({ description: '管理员登录密码' })
  @Length(6, 16)
  password!: string;

  @Field({ description: '初始化客户端链接，将作为 site_url 和 home_url 的初始值' })
  url!: string;

  @Field({ description: '管理员邮箱' })
  email!: string;
}
