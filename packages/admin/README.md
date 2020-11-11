# @plumemo/admin

### hooks

| name | type   | description                          |
| ---- | ------ | ------------------------------------ |
| init | action | theme/plugins 加载之后，Vue 实例之前 |

##### note: fork-ts-checker-webpack-plugin 与 @vue/cli-plugin-typescript 中的版本有冲突，如果把 core 加到 monorepo 时添加引用到 devDependencies 或者设置 nohoist 解决冲突问题
