# Po blog Nodejs后端系统

## 说明：

### Sequelize安装不同数据驱动
> 注：系统只对mysql做了处理

``` bash
安装
npm install sequelize

# 选择对应数据库驱动程序的安装:
$ npm install --save pg pg-hstore # Postgres
$ npm install --save mysql2
$ npm install --save mariadb
$ npm install --save sqlite3
$ npm install --save tedious # Microsoft SQL Server
```

### Authorized使用说明
在 `controler` 和 `model` 中使用 `@Authorized` 对 fields 或 resolver 添加的装饰器权限验证失败会提升到 http，返回401 或404。  
而 `dataSocurecs` 的方法使用使用的 `isAuthorized` 会 显示在 response.data 中。 
