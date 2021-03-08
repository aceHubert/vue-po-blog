/**
 * express router
 * restful api 权限验证部分
 */
import express from 'express';
import { validateOrReject, ValidationError } from 'class-validator';
import { AuthenticationError } from '@/utils/errors';
import { AuthHelper, UserLoginModel } from '@/dataSources';

// Types
import { Request } from 'express';
import { KeyValueCache } from 'apollo-server-caching';

export default function authRouter(cache: KeyValueCache) {
  const router = express.Router();
  const authHelper = new AuthHelper(cache);
  const getToken = function fromHeaderOrQuerystring(req: Request) {
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          return credentials;
        } else {
          throw new AuthenticationError('Format is Authorization: Bearer [token]');
        }
      } else {
        throw new AuthenticationError('Format is Authorization: Bearer [token]');
      }
    } else if (req.query && req.query.token) {
      return req.query.token as string;
    }
    return null;
  };

  router.get('/', (req, res) => res.send('🚀 Auth api is ready!'));

  /**
   * 登录
   */
  router.post('/login', async (req, res, next) => {
    const loginModel = Object.create(UserLoginModel.prototype);
    for (const key in req.body) {
      loginModel[key] = req.body[key];
    }

    try {
      await validateOrReject(loginModel);
    } catch (errors) {
      res.status(400).json({
        success: false,
        message: 'invalid params!',
        result: (errors as ValidationError[]).reduce((prev, err) => {
          prev[err.property] = Object.values(err.constraints || {});
          return prev;
        }, {} as Dictionary<any>),
      });
      return;
    }

    try {
      const tokenOrFalse = await authHelper.login(loginModel);
      if (tokenOrFalse) {
        res.json({
          success: true,
          ...tokenOrFalse,
        });
      } else {
        res.json({
          success: false,
          message: 'Login failed!',
        });
      }
    } catch (err) {
      next(err);
    }
  });

  /**
   * 刷新token
   */
  router.get('/refresh', async (req, res, next) => {
    const token = req.query.refreshtoken as string;
    if (token) {
      try {
        const newToken = await authHelper.refreshToken(token);
        res.json({
          success: true,
          ...newToken,
        });
      } catch (err) {
        next(err);
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'No token provided!',
      });
    }
  });

  /**
   * 登出
   */
  router.post('/logout', async (req, res, next) => {
    try {
      const token = getToken(req);
      if (token) {
        const payload = await authHelper.verifyToken(token);
        await authHelper.logout(payload.id);

        res.json({
          success: true,
          message: 'Log out successfully!',
        });
      } else {
        res.json({
          success: true,
          message: 'No token provided!',
        });
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}
