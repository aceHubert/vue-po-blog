module.exports = {
  rules: {
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        // 允许声明未使用变量
        vars: 'local',
        // 在使用的参数之前定义的不检测
        args: 'after-used',
        // 忽略以_开始或 h 的参数
        argsIgnorePattern: '^returns|of|type$',
      },
    ],
  },
};
