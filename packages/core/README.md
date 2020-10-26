# @plumemo/core

### hooks

> type 区别  
> filter: 有 1 个或多个参数，并且必须把处理完后的结果返回  
> action: 有 0 个或多个参数，并且无结果返回

| name                | type   | params                                        | returns            | description                          |
| ------------------- | ------ | --------------------------------------------- | ------------------ | ------------------------------------ |
| Http 请求           |        |                                               |                    |
| pre_request         | filter | (config:AxiosRequestConfig)                   | AxiosRequestConfig |                                      |
| request_error       | action | (error:AxiosError)                            | -                  |                                      |
| pre_response        | filter | (response:AxiosResponse<T>)                   | AxiosResponse<T>   |                                      |
| response_error      | action | (error:AxiosError)                            | -                  |                                      |
| 页面周期            |        |                                               |                    |                                      |
| init                | action | (context:Context)                             | -                  | theme/plugins 加载之后，Vue 实例之前 |
| head_title_template | filter | (titleTemplate:Layout:(title:string)=>string) | string             | (title:string)=> string              |  |
| layouts             | action | (layouts:Layout, name:string)                 | -                  |                                      |

<br>
<br>
<br>

##### note: fork-ts-checker-webpack-plugin 与 @vue/cli-plugin-typescript 中的版本有冲突，如果把 core 加到 monorepo 时添加引用到 devDependencies 或者设置 nohoist 解决冲突问题
