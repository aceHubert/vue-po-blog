# 在程序初始化之前加载的一些配置参数

模块按顺序加载，如遇到模块返回 `false` 则停止后面的模块加载。  
模块可以使用 `context` 中的 `redirect('/error')` 去跳转路由，`error` 方法在初始化之前无效。

## 1、initializer

> 从 Storage 中初始站点的配置

- 从 localeStorage 初始化网站的模版、样式等配置
- 从 cookie 初始化 `access token` 配置到 store 中；如果 `access token` 但是 `refresh token` 在在，则会从服务端拉取一个新的 `access token`；如果都不在在或在拉取新的时候出现错误，则会退出重新登录(init/signin/signout 页面跳过加载)
  <br/>
  <br/>

## 2、prepareDatas

> 初始化 Vue 启动时的一些常用方法扩展挂载到 instance 上通过 `this.` 轻松调用

- http/graphqlClient 封装方法
- 从 includes 中初始化一些常用方法
- `autoload options` 挂载到 `this.$autoloadOption` 上(init 页面跳过加载)
  <br/>
  <br/>

## 3、 loadModules

> 加载远程模块
