import { VueConstructor, Component } from 'vue';
import { print } from '@vue-async/utils';

export default function (Vue: VueConstructor, opts: any = {}) {
  print('comment-plugin', '加载成功');

}
