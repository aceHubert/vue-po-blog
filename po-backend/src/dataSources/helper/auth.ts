import md5 from 'md5';
import jwt from 'jsonwebtoken';
import { IsNotEmpty, MinLength } from 'class-validator';
import { isPlainObject } from 'lodash';
import { uuid } from '@/utils/uuid';
import { configs } from '@/utils/getConfig';
import { AuthenticationError } from '@/utils/errors';
import dbModels from '../entities';
import { UserRole, UserStatus } from './enums';

// Types
import { KeyValueCache } from 'apollo-server-caching';

export class UserLoginModel {
  @IsNotEmpty({ message: '登录名不能为空！' })
  loginName!: string;

  @IsNotEmpty({ message: '登录密码不能为空！' })
  @MinLength(6, { message: '登录密码必须大于6位' })
  loginPwd!: string;
}

export default class AuthHelper {
  private cache!: KeyValueCache;
  private models = dbModels;

  constructor(cache: KeyValueCache) {
    this.cache = cache;
  }

  private get tablePrefix() {
    return configs.get('table_prefix');
  }

  private getScrectCacheKey(userId: number) {
    return `USER_SCRECT_${userId}`;
  }

  private genNewScrect(userId: number) {
    // '[userId]_[uuid]_[config.jwt-screct]'
    return md5(`${userId}_${uuid()}_${configs.get('jwt_screct')}`);
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
    let screct = fromCache ? await this.cache.get(cacheKey) : null;
    if (!screct) {
      const screctMetaKey = `${this.tablePrefix}screct`;
      const screctMeta = await this.models.UserMeta.findOne({
        attributes: ['metaValue'],
        where: {
          userId,
          metaKey: screctMetaKey,
        },
      });
      if (screctMeta) {
        screct = screctMeta.metaValue;
      } else {
        // 数据库的screct丢失,将重新生成一个新的
        const newScrect = this.genNewScrect(userId);
        await this.models.UserMeta.create({
          userId,
          metaKey: screctMetaKey,
          metaValue: newScrect,
          private: 'yes',
        });
        screct = newScrect;
      }
      // 保存到缓存
      this.cache.set(cacheKey, screct);
    }
    return screct;
  }

  /**
   * 获取用户验证 refresh token 的screct
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   */
  async getRefreshTokenScrect(userId: number): Promise<string> {
    const screctMetaKey = `${this.tablePrefix}refresh_token_screct`;
    const screctMeta = await this.models.UserMeta.findOne({
      attributes: ['metaValue'],
      where: {
        userId,
        metaKey: screctMetaKey,
      },
    });

    if (screctMeta) {
      return screctMeta.metaValue;
    } else {
      // 数据库的screct丢失,将重新生成一个新的
      const newScrect = this.genNewScrect(userId);
      await this.models.UserMeta.create({
        userId,
        metaKey: screctMetaKey,
        metaValue: newScrect,
        private: 'yes',
      });
      return newScrect;
    }
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
    const newScrect = this.genNewScrect(userId);
    await this.cache.set(this.getScrectCacheKey(userId), newScrect);
    await this.models.UserMeta.update(
      {
        metaValue: newScrect,
      },
      {
        where: {
          userId,
          metaKey: `${this.tablePrefix}screct`,
        },
      },
    );

    return newScrect;
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
  async updateRefreshTokenScrect(userId: number): Promise<string> {
    const newScrect = this.genNewScrect(userId);
    await this.models.UserMeta.update(
      {
        metaValue: newScrect,
      },
      {
        where: {
          userId,
          metaKey: `${this.tablePrefix}refresh_token_screct`,
        },
      },
    );
    return newScrect;
  }

  /**
   * 登录
   * 成功则返回token，否则返回 false
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param model 登录实体
   */
  async login(
    model: UserLoginModel,
  ): Promise<false | { accessToken: string; expiresIn: number; refreshToken: string }> {
    const user = await this.models.Users.findOne({
      attributes: ['id', 'loginName', 'createdAt'],
      where: {
        loginName: model.loginName,
        loginPwd: md5(model.loginPwd),
        status: UserStatus.Enable,
      },
    });

    if (user) {
      // 角色
      const role = await this.models.UserMeta.findOne({
        attributes: ['metaValue'],
        where: {
          userId: user.id,
          metaKey: `${this.tablePrefix}role`,
        },
      });

      const jwtScrect = await this.getScrect(user.id, false);
      const jwtRefreshTokenScrect = await this.getRefreshTokenScrect(user.id);

      const payload = {
        ...user.toJSON(),
        role: role ? role.metaValue : null,
      } as JwtPayload;
      const expiresIn = configs.get('jwt_expiresIn');

      return {
        accessToken: jwt.sign(payload, jwtScrect, {
          algorithm: configs.get('jwt_algorithm'),
          expiresIn,
        }),
        expiresIn: typeof expiresIn === 'string' ? require('ms')(expiresIn) / 1000 : expiresIn,
        refreshToken: jwt.sign(payload, jwtRefreshTokenScrect, {
          algorithm: configs.get('jwt_algorithm'),
          expiresIn: configs.get('jwt_refresh_token_expiresIn'),
        }),
      };
    } else {
      return false;
    }
  }

  /**
   * 验证 access token
   * verify token 和 token revoked 都在这里判断了
   * 异常会抛出 AuthenticationError
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
        throw new AuthenticationError('Invalid token!');
      }
    } else {
      throw new AuthenticationError('Invalid token!');
    }
  }

  /**
   * 验证 refresh token
   * 异常会抛出 AuthenticationError
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
        throw new AuthenticationError('Invalid token!');
      }
    } else {
      throw new AuthenticationError('Invalid token!');
    }
  }

  /**
   * decode token
   * 异常会抛出 AuthenticationError
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
      throw new AuthenticationError('Invalid token!');
    }
  }

  /**
   * 通过 refreshToken 刷新 token
   * 如果 refresh token 无效, 会抛出 AuthenticationError
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param token Token
   */
  async refreshToken(token: string): Promise<false | { accessToken: string; expiresIn: number }> {
    let payload = await this.verifyRefreshToken(token);
    if (payload && isPlainObject(payload) && payload.id) {
      // 角色(刷新时重新获取，以免在中途被修改)
      const role = await this.models.UserMeta.findOne({
        attributes: ['metaValue'],
        where: {
          userId: payload.id,
          metaKey: `${this.tablePrefix}role`,
        },
      });

      payload = {
        id: payload.id,
        loginName: payload.loginName,
        role: role ? (role.metaValue as UserRole) : null,
        createdAt: payload.createdAt,
      };

      const jwtScrect = await this.updateScrect(payload.id);
      const expiresIn = configs.get('jwt_expiresIn');

      return {
        accessToken: jwt.sign(payload, jwtScrect, {
          algorithm: configs.get('jwt_algorithm'),
          expiresIn,
        }),
        expiresIn: typeof expiresIn === 'string' ? require('ms')(expiresIn) / 1000 : expiresIn,
      };
    } else {
      return false;
    }
  }

  /**
   * 登出
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param userId User id
   */
  async logout(userId: number): Promise<true> {
    await this.updateScrect(userId);
    await this.updateRefreshTokenScrect(userId);
    return true;
  }
}
