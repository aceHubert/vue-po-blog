/**
 * 默认左侧菜单配置
 */
import { bxAnaalyse } from '@/assets/icons';

export default [
  {
    name: 'dashboard',
    title: 'menu.dashboard',
    icon: bxAnaalyse,
    permission: [],
  },
  {
    name: 'article',
    title: 'menu.article',
    icon: '',
    permission: [],
  },
  {
    name: 'media',
    title: 'menu.media',
    icon: '',
    permission: [],
  },
  {
    name: 'page',
    title: 'menu.page',
    icon: '',
    permission: [],
  },
  {
    name: 'lib',
    title: 'menu.lib',
    icon: '',
    permission: [],
  },
  {
    name: 'theme',
    title: 'menu.theme.root',
    icon: '',
    permission: [],
    children: [
      {
        name: 'theme-color',
        title: 'menu.theme.color',
        icon: '',
        permission: [],
      },
    ],
  },
];
