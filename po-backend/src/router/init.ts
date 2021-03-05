/**
 * express router
 * restful api 权限验证部分
 */
import express from 'express';
import { validateOrReject, ValidationError } from 'class-validator';
import { InitHelper, InitDBArgs } from '@/dataSources';

// Types
import { KeyValueCache } from 'apollo-server-caching';

export default function initRouter(cache: KeyValueCache) {
  const router = express.Router();
  const initHelper = new InitHelper(cache);

  router.get('/', (req, res) => res.send('🚀 Init api is ready!'));

  /**
   * 检查数据库是否已经初始化完成
   */
  router.get('/check', async (req, res, next) => {
    try {
      const result = await initHelper.haveTables();
      res.json({
        success: true,
        initRequired: !result,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * 初始化数据库，如果数据库已经初始化完成，则会直接跳过并返回 true
   */
  router.post('/start', async (req, res, next) => {
    const initArgs = Object.create(InitDBArgs.prototype);
    for (const key in req.body) {
      initArgs[key] = req.body[key];
    }
    try {
      await validateOrReject(initArgs);
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
      const result = await initHelper.initDB({
        alter: true,
        match: /_dev$/,
        when: () => initHelper.haveTables().then((haveTables) => !haveTables),
      });

      if (typeof result === 'boolean') {
        // true 第一次建表, 初始化数据
        if (result) {
          try {
            const success = await initHelper.initDatas(initArgs);
            res.json({
              success,
              message: !success ? 'An error occurred during init datas!' : null,
            });
          } catch (err) {
            next(err);
          }
        } else {
          res.json({
            success: true,
          });
        }
      } else {
        next(result);
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}
