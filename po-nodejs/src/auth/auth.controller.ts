import { Body, Controller, Query, Post, Scope } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BaseController } from '@/common/controllers/base.controller';
import { AuthService } from './auth.service';

// Types
import { UserLoginDto } from './dto/user-login.dto';
import { UpdatePwdDto } from './dto/update-pwd.dto';
import { Token, RefreshToken } from './interfaces/token.interface';

@ApiTags('auth')
@Controller({ path: 'api/auth', scope: Scope.REQUEST })
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('signin')
  async signin(@Body() userLoginDto: UserLoginDto, @I18n() i18n: I18nContext): Promise<Response<Token>> {
    const tokenOrFalse = await this.authService.signin(
      userLoginDto.username,
      userLoginDto.password,
      userLoginDto.device,
    );
    if (tokenOrFalse) {
      return this.success(tokenOrFalse);
    } else {
      return this.faild(await i18n.tv('core.auth.signin.faild', 'Username or password is incorrect!'));
    }
  }

  @Post('refresh')
  async refresh(@Query('refreshtoken') token: string, @I18n() i18n: I18nContext): Promise<Response<RefreshToken>> {
    try {
      const newTokenOrFalse = await this.authService.refreshToken(token, i18n.detectedLanguage);
      if (newTokenOrFalse) {
        return this.success(newTokenOrFalse);
      } else {
        return this.faild(await i18n.tv('core.error.invalid_token', 'Invalid token!'));
      }
    } catch (err: any) {
      return this.faild(err);
    }
  }

  @Authorized()
  @Post('update-pwd')
  @ApiBearerAuth()
  async updatePwd(
    @User('id') userId: number,
    @Body() updatePwdDto: UpdatePwdDto,
    @I18n() i18n: I18nContext,
  ): Promise<Response<{ message: string }>> {
    const result = await this.authService.updatePwd(userId, updatePwdDto.oldPwd, updatePwdDto.newPwd);
    if (result) {
      return this.success({
        message: await i18n.tv('core.auth.update_pwd.success', 'Update password successful!'),
      });
    } else {
      return this.faild(await i18n.tv('core.auth.update_pwd.old_pwd_incorrect', 'The old password is incorrect!'));
    }
  }

  @Authorized()
  @Post('signout')
  async signout(
    @User('id') userId: number,
    @User('device') device: string,
    @I18n() i18n: I18nContext,
  ): Promise<Response<{ message: string }>> {
    await this.authService.signout(userId, device);
    return this.success({
      message: await i18n.tv('core.auth.signout.success', 'Sign out successful!'),
    });
  }
}
