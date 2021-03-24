import jwt from 'jsonwebtoken';
import { isPlainObject } from 'lodash';
import { Injectable, UnauthorizedException, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
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
    private readonly config: ConfigService,
    private readonly userDataSource: UserDataSource,
  ) {}

  private getScrectCacheKey(userId: number) {
    return `USER_SCRECT_${userId}`;
  }

  /**
   * jwt 协议， 默认：HS256
   */
  get JwtAlgorithm() {
    return this.config.get('jwt_algorithm');
  }

  /**
   * jwt access token 过期时间，默认：30 minutes
   */
  get jwtTokenExpiresIn() {
    return this.config.get('jwt_expiresIn');
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
    return this.config.get('jwt_refresh_token_expiresIn') || '15d';
  }

  /**
   * 获取用户验证 access token 的screct
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   * @param fromCache 优先从缓存中读取
   */
  async getScrect(userId: number, fromCache: boolean = true): Promise<string> {
    const cacheKey = this.getScrectCacheKey(userId);
    let screct = fromCache ? await this.cache.get<string>(cacheKey) : null;
    if (!screct) {
      screct = await this.userDataSource.getTokenScrect(userId);
      // 保存到缓存
      await this.cache.set(cacheKey, screct, { ttl: this.jwtTokenExpiresInSeconds }, (err) => {
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
   * @param userId User id
   */
  getRefreshTokenScrect(userId: number): Promise<string> {
    return this.userDataSource.getTokenScrect(userId, true);
  }

  /**
   * 修改 access token 的 screct
   * 在登出，修改密码，忘记密码，更新Token 等场景中更新screct 来 Revoke 历史 token
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   */
  async updateScrect(userId: number): Promise<string> {
    const screct = await this.userDataSource.updateTokenScrect(userId);
    // 修改到缓存
    await this.cache.set(this.getScrectCacheKey(userId), screct, { ttl: this.jwtTokenExpiresInSeconds }, (err) => {
      err && this.logger.error(`Set cache error, ${err.message}`);
    });
    return screct;
  }

  /**
   * 修改 refresh token 的 screct
   * 在登出，修改密码，忘记密码等场景中更新screct 来 Revoke 历史 refresh token
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   */
  updateRefreshTokenScrect(userId: number): Promise<string> {
    return this.userDataSource.updateTokenScrect(userId, true);
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
  async verifyToken(token: string, options?: jwt.VerifyOptions): Promise<JwtPayload> {
    const payload = this.decodeToken(token);
    if (payload && isPlainObject(payload) && payload.id) {
      const screct = await this.getScrect(payload.id);
      try {
        jwt.verify(token, screct, options);
        return payload;
      } catch {
        throw new UnauthorizedException('Invalid token!');
      }
    } else {
      throw new UnauthorizedException('Invalid token!');
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
  async verifyRefreshToken(token: string, options?: jwt.VerifyOptions): Promise<JwtPayload> {
    const payload = this.decodeToken(token);
    if (payload && isPlainObject(payload) && payload.id) {
      const screct = await this.getRefreshTokenScrect(payload.id);
      try {
        jwt.verify(token, screct, options);
        return payload;
      } catch {
        throw new UnauthorizedException('Invalid token!');
      }
    } else {
      throw new UnauthorizedException('Invalid token!');
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
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token, { json: true }) as JwtPayload | null;
    } catch (err) {
      throw new UnauthorizedException('Invalid token!');
    }
  }

  /**
   * 登录
   * 成功则返回token，否则返回 false
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param loginName 登录名/邮箱/手机号码
   */
  async login(username: string, password: string): Promise<false | TokenResponse> {
    const payload = await this.userDataSource.verifyUser(username, password);
    if (payload) {
      const jwtScrect = await this.getScrect(payload.id, false);
      const jwtRefreshTokenScrect = await this.getRefreshTokenScrect(payload.id);

      return {
        accessToken: jwt.sign(payload, jwtScrect, {
          algorithm: this.JwtAlgorithm,
          expiresIn: this.jwtTokenExpiresIn,
        }),
        expiresIn: this.jwtTokenExpiresInSeconds,
        refreshToken: jwt.sign(payload, jwtRefreshTokenScrect, {
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
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token refresh token
   */
  async refreshToken(token: string): Promise<false | RefreshTokenResponse> {
    let payload = await this.verifyRefreshToken(token);
    if (payload && isPlainObject(payload) && payload.id) {
      // 角色(刷新时重新获取，以免在中途被修改)
      const role = await this.userDataSource.getRole(payload.id);

      payload = {
        id: payload.id,
        loginName: payload.loginName,
        role,
        createdAt: payload.createdAt,
      };

      const jwtScrect = await this.updateScrect(payload.id);

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
   * @param userId User id
   * @param oldPwd 旧密码
   * @param newPwd 新密码
   */
  updatePwd(userId: number, oldPwd: string, newPwd: string): Promise<boolean> {
    return this.userDataSource.updateLoginPwd(userId, oldPwd, newPwd);
  }

  /**
   * 登出
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   */
  async logout(userId: number): Promise<void> {
    await this.updateScrect(userId);
    await this.updateRefreshTokenScrect(userId);
  }
}
