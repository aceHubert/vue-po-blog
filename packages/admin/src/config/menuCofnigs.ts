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
      name: 'articles',
      title: 'menu.article',
      icon: bxAnaalyse,
    },
    {
      name: 'medias',
      title: 'menu.media',
      icon: bxAnaalyse,
    },
    {
      name: 'pages',
      title: 'menu.page',
      icon: bxAnaalyse,
    },
    {
      name: 'libs',
      title: 'menu.lib',
      icon: bxAnaalyse,
    },
    {
      name: 'theme-color',
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
    {
      name: 'plugins',
      title: 'menu.plugin.root',
      icon: bxAnaalyse,
      children: [
        {
          name: 'plugins-installed',
          title: 'menu.plugin.install',
          icon: bxAnaalyse,
        },
        {
          name: 'plugins',
          title: 'menu.plugin.plugins',
          icon: bxAnaalyse,
        },
      ],
    },
  ];
}
