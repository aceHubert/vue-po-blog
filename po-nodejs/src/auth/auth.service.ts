import jwt from 'jsonwebtoken';
import { isPlainObject } from 'lodash';
import { Injectable, UnauthorizedException, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Cache } from 'cache-manager';
import { ConfigService } from '@/config/config.service';
import { UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { TokenResponse, RefreshTokenResponse } from './interfaces/token-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
    private readonly userDataSource: UserDataSource,
  ) {}

  /**
   * 获取 access_token cache key
   * @param userId 用户Id
   * @param drivceId 设备Id
   */
  private getScrectCacheKey(userId: number, deviceId: string) {
    return `USER_SCRECT_${userId}_${deviceId}`;
  }

  /**
   * jwt 协议， 默认：HS256
   */
  get JwtAlgorithm() {
    return this.configService.get('jwt_algorithm');
  }

  /**
   * jwt access token 过期时间，默认：30 minutes
   */
  get jwtTokenExpiresIn() {
    return this.configService.get('jwt_expiresIn');
  }

  /**
   * jwt access token 转换成秒的过期时间
   */
  get jwtTokenExpiresInSeconds() {
    return typeof this.jwtTokenExpiresIn === 'string'
      ? require('ms')(this.jwtTokenExpiresIn) / 1000
      : this.jwtTokenExpiresIn;
  }

  /**
   * jwt refresh token 过期时间，默认：15 days
   */
  get jwtRefreshTokenExpiresIn() {
    return this.configService.get('jwt_refresh_token_expiresIn') || '15d';
  }

  /**
   * 获取用户验证 access token 的screct
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId 用户 Id
   * @param device 设备名称
   * @param fromCache 优先从缓存中读取
   */
  async getScrect(userId: number, device: string, fromCache: boolean = true): Promise<string> {
    const deviceId = this.userDataSource.getDeviceId(userId, device);
    const cacheKey = this.getScrectCacheKey(userId, deviceId);
    let screct = fromCache ? await this.cache.get<string>(cacheKey) : null;
    if (!screct) {
      screct = await this.userDataSource.getTokenScrect(userId, device);
      // 保存到缓存
      this.cache.set(cacheKey, screct, { ttl: this.jwtTokenExpiresInSeconds }, (err) => {
        err && this.logger.error(`Set cache error, ${err.message}`);
      });
    }
    return screct!;
  }

  /**
   * 获取用户验证 refresh token 的screct
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId 用户 Id
   * @param device 设备名称
   */
  getRefreshTokenScrect(userId: number, device: string): Promise<string> {
    return this.userDataSource.getTokenScrect(userId, device, true);
  }

  /**
   * 修改 access token 的 screct
   * 在登出，修改密码，忘记密码，更新Token 等场景中更新screct 来 Revoke 历史 token
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId 用户 Id
   * @param device 设备名称
   */
  async updateScrect(userId: number, device: string): Promise<string> {
    const deviceId = this.userDataSource.getDeviceId(userId, device);
    const cacheKey = this.getScrectCacheKey(userId, deviceId);
    const screct = await this.userDataSource.updateTokenScrect(userId, device);
    // 修改到缓存
    this.cache.set(cacheKey, screct, { ttl: this.jwtTokenExpiresInSeconds }, (err) => {
      err && this.logger.error(`Set cache error, ${err.message}`);
    });
    return screct;
  }

  // 暂时没有场景需要修改 refresh token
  // /**
  //  * 修改 refresh token 的 screct
  //  * 在登出，修改密码，忘记密码等场景中更新screct 来 Revoke 历史 refresh token
  //  * @author Hubert
  //  * @since 2020-10-01
  //  * @version 0.0.1
  //  * @access None
  //  * @param userId 用户 Id
  //  * @param device 设备名称
  //  */
  // updateRefreshTokenScrect(userId: number, device: string): Promise<string> {
  //   return this.userDataSource.updateTokenScrect(userId, device, true);
  // }

  /**
   * 重置 access/refresh token 的 screct
   * @param userId 用户 Id
   * @param device 设备名称，为 null 时重置所有
   */
  async resetScrect(userId: number, device: string | null): Promise<void> {
    const deviceIds = await this.userDataSource.resetTokenScrect(userId, device);
    // 清除缓存
    deviceIds.forEach((deviceId) => {
      const cacheKey = this.getScrectCacheKey(userId, deviceId);
      this.cache.del(cacheKey, (err) => {
        err && this.logger.error(`Delete cache error, ${err.message}`);
      });
    });
    await this.userDataSource.resetTokenScrect(userId, device, true);
  }

  /**
   * 验证 access token
   * verify token 和 token revoked 都在这里判断了
   * 异常会抛出 UnauthorizedException
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token access_token
   * @param options jwt.VerifyOptions
   */
  async verifyToken(token: string, options?: jwt.VerifyOptions & { lang?: string }): Promise<JwtPayload> {
    const { lang, ...jwtOptions } = options || {};
    const payload = await this.decodeToken(token);
    if (payload && isPlainObject(payload) && payload.id) {
      const screct = await this.getScrect(payload.id, payload.device);
      try {
        jwt.verify(token, screct, jwtOptions);
        return payload;
      } catch {
        throw new UnauthorizedException(await this.i18nService.t('error.invalid_token', { lang }));
      }
    } else {
      throw new UnauthorizedException(await this.i18nService.t('error.invalid_token', { lang }));
    }
  }

  /**
   * 验证 refresh token
   * 异常会抛出 UnauthorizedException
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token refresh_token
   * @param options jwt.VerifyOptions
   */
  async verifyRefreshToken(
    refreshToken: string,
    options?: jwt.VerifyOptions & { lang?: string },
  ): Promise<Omit<JwtPayload, 'role'>> {
    const { lang, ...jwtOptions } = options || {};
    const payload = await this.decodeToken(refreshToken, { lang });
    if (payload && isPlainObject(payload) && payload.id) {
      const screct = await this.getRefreshTokenScrect(payload.id, payload.device);
      try {
        jwt.verify(refreshToken, screct, jwtOptions);
        return payload;
      } catch {
        throw new UnauthorizedException(await this.i18nService.t('error.invalid_token', { lang }));
      }
    } else {
      throw new UnauthorizedException(await this.i18nService.t('error.invalid_token', { lang }));
    }
  }

  /**
   * decode token
   * 异常会抛出 UnauthorizedException
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token token
   */
  async decodeToken(token: string, options?: jwt.DecodeOptions & { lang?: string }): Promise<JwtPayload | null> {
    const { lang, ...jwtOptions } = options || {};
    try {
      return jwt.decode(token, { ...jwtOptions, json: true }) as JwtPayload | null;
    } catch (err) {
      throw new UnauthorizedException(await this.i18nService.t('error.invalid_token', { lang }));
    }
  }

  /**
   * 登录
   * 成功则返回token，否则返回 false
   * refresh token 中不包含role
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param loginName 登录名/邮箱/手机号码
   * @param password 登录密码
   * @param device 设备名称
   */
  async login(username: string, password: string, device: string): Promise<false | TokenResponse> {
    const payload = await this.userDataSource.verifyUser(username, password, ['id', 'loginName', 'createdAt']);
    if (payload) {
      const jwtScrect = await this.getScrect(payload.id, device, false);
      const jwtRefreshTokenScrect = await this.getRefreshTokenScrect(payload.id, device);

      // access token 设置角色
      const role = await this.userDataSource.getRole(payload.id);

      return {
        accessToken: jwt.sign({ ...payload, role, device }, jwtScrect, {
          algorithm: this.JwtAlgorithm,
          expiresIn: this.jwtTokenExpiresIn,
        }),
        expiresIn: this.jwtTokenExpiresInSeconds,
        refreshToken: jwt.sign({ ...payload, device }, jwtRefreshTokenScrect, {
          algorithm: this.JwtAlgorithm,
          expiresIn: this.jwtRefreshTokenExpiresIn,
        }),
      };
    } else {
      return false;
    }
  }

  /**
   * 通过 refreshToken 刷新 token
   * 如果 refresh token 无效, 会抛出 UnauthorizedException
   * 会重新获取role
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token refresh token
   */
  async refreshToken(refreshToken: string, lang?: string): Promise<false | RefreshTokenResponse> {
    const refreshTokenPayload = await this.verifyRefreshToken(refreshToken, { lang });
    if (refreshTokenPayload && isPlainObject(refreshTokenPayload) && refreshTokenPayload.id) {
      const jwtScrect = await this.updateScrect(refreshTokenPayload.id, refreshTokenPayload.device);

      // 重新获取一次 role
      const role = await this.userDataSource.getRole(refreshTokenPayload.id);

      const payload: JwtPayload = {
        id: refreshTokenPayload.id,
        loginName: refreshTokenPayload.loginName,
        role,
        device: refreshTokenPayload.device,
        createdAt: refreshTokenPayload.createdAt,
      };

      return {
        accessToken: jwt.sign(payload, jwtScrect, {
          algorithm: this.JwtAlgorithm,
          expiresIn: this.jwtTokenExpiresIn,
        }),
        expiresIn: this.jwtTokenExpiresInSeconds,
      };
    } else {
      return false;
    }
  }

  /**
   * 修改密码
   * 旧密码不正确返回 false
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId 用户 Id
   * @param oldPwd 旧密码
   * @param newPwd 新密码
   */
  async updatePwd(userId: number, oldPwd: string, newPwd: string): Promise<boolean> {
    const result = await this.userDataSource.updateLoginPwd(userId, oldPwd, newPwd);
    await this.resetScrect(userId, null);
    return result;
  }

  /**
   * 登出
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId 用户 Id
   * @param device 设备名称
   */
  async logout(userId: number, device: string | null): Promise<void> {
    await this.resetScrect(userId, device);
  }
}
