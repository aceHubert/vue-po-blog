# @plumemo/devtools
包含 `类型定义` 和 `模块调试工具`  
<br>

``` bash
// run dev module
po dev [options] <entry>

// build modules
po build [options] <entry>
```

## \<entry\>  
入口文件或文件夹，详情查看 `vue-cli-service` [entry] 说明
<br>
<br>

## dev [options]
  `--name`  
  类型：string  
  lib 名，（默认值：pakcage.json name 字段 或 entry 文件名）  

  `--filename`  
  类型：string  
  输出文件名，（默认值：--name 的值）  

  `--dest`  
  类型：string
  输出文件路径，（默认值： dist）

  `--plugin`  
  类型：boolean
  调试模块是否是插件，否则以主题模块运行

  `--port`  
  类型：number
  调试服务器端口，（默认：5005）

  `--host`  
  类型：string
  调试服务器IP, (默认：0.0.0.0)




## build [options]
  `--name`  
  类型：string  
  lib 名，（默认值：pakcage.json name 字段 或 entry 文件名）  

  `--filename`  
  类型：string  
  输出文件名，（默认值：--name 的值）  

  `--dest`  
  类型：string
  输出文件路径，（默认值： dist）

  `--info`  
  类型：boolean
  是否显示编译详细信息，（默认值： false）
