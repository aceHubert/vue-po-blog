import { Body, Controller, Query, Post, Scope } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BaseController } from '@/common/controllers/base.controller';
import { AuthService } from './auth.service';

// Types
import { UserLoginDto } from './dto/user-login.dto';
import { UpdatePwdDto } from './dto/update-pwd.dto';
import { TokenResponse, RefreshTokenResponse } from './interfaces/token-response.interface';

@Controller({ path: 'api/auth', scope: Scope.REQUEST })
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto, @I18n() i18n: I18nContext): Promise<Response<TokenResponse>> {
    const tokenOrFalse = await this.authService.login(
      userLoginDto.username,
      userLoginDto.password,
      userLoginDto.device,
    );
    if (tokenOrFalse) {
      return this.success(tokenOrFalse);
    } else {
      return this.faild(await i18n.t('auth.login.faild'));
    }
  }

  @Post('refresh')
  async refresh(
    @Query('refreshtoken') token: string,
    @I18n() i18n: I18nContext,
  ): Promise<Response<RefreshTokenResponse>> {
    try {
      const newToken = await this.authService.refreshToken(token, i18n.detectedLanguage);
      if (newToken) {
        return this.success(newToken);
      } else {
        return this.faild(await i18n.t('error.invalid_token'));
      }
    } catch (err) {
      return this.faild(err.message);
    }
  }

  @Authorized()
  @Post('update-pwd')
  async updatePwd(
    @User('id') userId: number,
    @Body() updatePwdDto: UpdatePwdDto,
    @I18n() i18n: I18nContext,
  ): Promise<Response<{ message: string }>> {
    const result = await this.authService.updatePwd(userId, updatePwdDto.oldPwd, updatePwdDto.newPwd);
    if (result) {
      return this.success({
        message: await i18n.t('auth.update_pwd.success'),
      });
    } else {
      return this.faild(await i18n.t('auth.update_pwd.old_pwd_incorrect'));
    }
  }

  @Authorized()
  @Post('logout')
  async logout(
    @User('id') userId: number,
    @User('device') device: string,
    @I18n() i18n: I18nContext,
  ): Promise<Response<{ message: string }>> {
    await this.authService.logout(userId, device);
    return this.success({
      message: await i18n.t('auth.logout.success'),
    });
  }
}
