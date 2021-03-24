import { IsNotEmpty, MinLength, IsLocale, IsUrl, IsEmail } from 'class-validator';

export class InitArgs {
  @IsNotEmpty({ message: '博客标题不能为空！' })
  title!: string;

  @IsNotEmpty({ message: '管理员登录密码不可为空！' })
  @MinLength(6, { message: '管理员登录密码必须大于6位' })
  password!: string;

  @IsNotEmpty({ message: '默认使用语言不可为空！' })
  @IsLocale({ message: '默认使用语言格式不正确' })
  locale!: string;

  @IsNotEmpty({ message: '初始化客户端链接不可为空（作为 site_url 和 home_url 的初始值）！' })
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false }, { message: '链接格式不正确' })
  siteUrl!: string;

  @IsNotEmpty({ message: '管理员邮箱不可为空！' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;
}
