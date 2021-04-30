import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { appStore, userStore } from '@/store/modules';
import { isAbsoluteUrl } from '@/utils/path';
import settingsFuncs from './settings';
import hook from './hooks';

// Types
import { HttpInstance, Response } from 'types/functions/http';

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * http instance
 * 返回结果通过 interceptors.response 有作修改
 * timeout 默认 10s
 */
const instance = axios.create({
  timeout: 10000,
}) as HttpInstance;

/**
 * 用于区分返回类型
 */
instance.getList = instance.get;

/**
 * request interceptor
 * 添加 Authorization header
 * 添加 baseUrl (有条件情况下)
 */
instance.interceptors.request.use((config: AxiosRequestConfig) => {
  return hook('pre_request')
    .exec(config)
    .then(() => {
      // 如果请求地址非绝对地址的话，添加上baseUrl
      if (!(config.url && isAbsoluteUrl(config.url))) {
        config.baseURL = settingsFuncs.getApiPath();
      }
      const token = userStore.accessToken;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      const locale = appStore.locale;
      if (locale) {
        config.headers['x-custom-locale'] = locale;
      }
      return config;
    });
});

/**
 * response interceptor
 * 修改 response 结果适配到 HttpInstance
 * 如返回401会通过 refresh token 刷新 access token 后重试，失败则登出
 * 如遇到网络问题会进行重试
 */
instance.interceptors.response.use(
  (resp: AxiosResponse<Response<any>>) => {
    return hook('pre_response')
      .exec(resp)
      .then(() => {
        const data = resp.data;
        if (!data.success) {
          return Promise.reject(new Error(data.message || 'Response error'));
        } else {
          return data;
        }
      });
  },
  (err: AxiosError) => {
    return hook('response_error')
      .exec(err)
      .then(() => {
        if (err.response) {
          const statusCode = err.response.status;
          if (statusCode === 401) {
            // 401 后通过 refresh token 重新获取 access token,如果再不成功则退出重新登录
            return userStore
              .refreshToken()
              .then(() => {
                const config = err.config;
                config.headers['Authorization'] = `Bearer ${userStore.accessToken}`;
                return instance(config);
              })
              .catch(() => {
                appStore.goToLogoutPage();
              });
          } else if (statusCode === 500) {
            // 需要初始化
            if (err.response.data?.dbInitRequired) {
              appStore.goToInitPage();
            }
          }
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          if (err.message === 'Network Error') {
            const config = err.config;
            if (config && config.retry) {
              // Set the variable for keeping track of the retry count
              config.__retryCount = config.__retryCount || 0;

              // Check if we've maxed out the total number of retries
              if (config.__retryCount < config.retry) {
                // Increase the retry count
                config.__retryCount += 1;

                // Create new promise to handle exponential backoff.
                // formula(2 ^ c - 1 / 2) * 1000(for mS to seconds)
                const backoff = new Promise((resolve) => {
                  const backOffDelay = config.retryDelay ? (1 / 2) * (Math.pow(2, config.__retryCount!) - 1) * 1000 : 1;
                  setTimeout(() => {
                    resolve(null);
                  }, backOffDelay);
                });

                // Return the promise in which recalls axios to retry the request
                return backoff.then(() => {
                  return instance(config);
                });
              }
            }
          }
        }
        // Compatible server-side custom error
        if (err.isAxiosError) {
          const data = (err.response && err.response.data) || {};
          err.code = data.statusCode || 500;
          err.message = data.message || data.error || err.message || 'net::ERR_CONNECTION_REFUSED';
        }
        return Promise.reject(err);
      });
  },
);

export default instance;
