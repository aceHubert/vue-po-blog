/**
 * 默认左侧菜单配置
 */
import { bxAnaalyse } from '@/assets/icons';

// Types
import { Menu } from 'types/functions';

export function getDefaultMenus(): Menu[] {
  return [
    {
      name: 'dashboard',
      title: 'menu.dashboard',
      icon: bxAnaalyse,
    },
    {
      name: 'article',
      title: 'menu.article',
      icon: bxAnaalyse,
    },
    {
      name: 'media',
      title: 'menu.media',
      icon: bxAnaalyse,
    },
    {
      name: 'page',
      title: 'menu.page',
      icon: bxAnaalyse,
    },
    {
      name: 'lib',
      title: 'menu.lib',
      icon: bxAnaalyse,
    },
    {
      name: 'theme',
      title: 'menu.theme.root',
      icon: bxAnaalyse,
      children: [
        {
          name: 'theme-color',
          title: 'menu.theme.color',
          icon: bxAnaalyse,
        },
      ],
    },
  ];
}
