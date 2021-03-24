import { Body, Controller, Query, Post, UseGuards, Scope } from '@nestjs/common';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { AuthorizedGuard } from '@/common/guards/authorized.guard';
import { AuthService } from './auth.service';

// Types
import { UserLoginDto } from './dto/user-login.dto';
import { UpdatePwdDto } from './dto/update-pwd.dto';
import { TokenResponse, RefreshTokenResponse } from './interfaces/token-response.interface';

@Controller({ path: 'api/auth', scope: Scope.REQUEST })
@UseGuards(AuthorizedGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto): Promise<Response<TokenResponse>> {
    const tokenOrFalse = await this.authService.login(userLoginDto.username, userLoginDto.password);
    if (tokenOrFalse) {
      return {
        success: true,
        ...tokenOrFalse,
      };
    } else {
      return {
        success: false,
        message: 'Username or password is incorrect!',
      };
    }
  }

  @Post('refresh')
  async refresh(@Query('refreshtoken') token: string): Promise<Response<RefreshTokenResponse>> {
    try {
      const newToken = await this.authService.refreshToken(token);
      if (newToken) {
        return {
          success: true,
          ...newToken,
        };
      } else {
        return {
          success: false,
          message: 'Invalid token!',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  @Authorized()
  @Post('update-pwd')
  async updatePwd(
    @User('id') userId: number,
    @Body() updatePwdDto: UpdatePwdDto,
  ): Promise<Response<{ message: string }>> {
    const result = await this.authService.updatePwd(userId, updatePwdDto.oldPwd, updatePwdDto.newPwd);
    if (result) {
      return {
        success: true,
        message: 'Update sucessfully!',
      };
    } else {
      return {
        success: false,
        message: 'The old password is incorrect!',
      };
    }
  }

  @Authorized()
  @Post('logout')
  async logout(@User('id') userId: number): Promise<Response<{ message: string }>> {
    await this.authService.logout(userId);
    return {
      success: true,
      message: 'Log out successfully!',
    };
  }
}
