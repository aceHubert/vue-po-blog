/**
 * 默认左侧菜单配置
 */
import { dashboard, page, article, media, theme, plugin, tool, setting } from '@/assets/icons';

// Types
import { Menu } from 'types/functions';

export function getDefaultMenus(): Menu[] {
  return [
    {
      name: 'dashboard',
      title: 'menu.dashboard',
      icon: dashboard,
    },
    {
      name: 'articles',
      title: 'menu.article.root',
      icon: article,
      children: [
        {
          name: 'articles',
          title: 'menu.article.articles',
        },
        {
          name: 'articles-create',
          title: 'menu.article.create',
        },
        {
          name: 'tags',
          title: 'menu.article.tags',
        },
        {
          name: 'categories',
          title: 'menu.article.categories',
        },
      ],
    },
    {
      name: 'medias',
      title: 'menu.media.root',
      icon: media,
      children: [
        {
          name: 'medias',
          title: 'menu.media.medias',
        },
        {
          name: 'medias-create',
          title: 'menu.media.create',
        },
      ],
    },
    {
      name: 'pages',
      title: 'menu.page.root',
      icon: page,
      children: [
        {
          name: 'pages',
          title: 'menu.page.pages',
        },
        {
          name: 'pages-create',
          title: 'menu.page.create',
        },
      ],
    },
    {
      name: 'themes',
      title: 'menu.theme.root',
      icon: theme,
      children: [
        {
          name: 'themes',
          title: 'menu.theme.themes',
        },
        {
          name: 'themes-customize',
          title: 'menu.theme.customize',
        },
        {
          name: 'themes-color',
          title: 'menu.theme.color',
        },
        {
          name: 'themes-widgets',
          title: 'menu.theme.widgets',
        },
      ],
    },
    {
      name: 'plugins',
      title: 'menu.plugin.root',
      icon: plugin,
      children: [
        {
          name: 'plugins',
          title: 'menu.plugin.plugins',
        },
        {
          name: 'plugins-installed',
          title: 'menu.plugin.installed',
        },
      ],
    },
    {
      name: 'tools',
      title: 'menu.tools.root',
      icon: tool,
      children: [
        {
          name: 'tools-import',
          title: 'menu.tools.import',
        },
        {
          name: 'tools-export',
          title: 'menu.tools.export',
        },
      ],
    },
    {
      name: 'settings',
      title: 'menu.settings.root',
      icon: setting,
      children: [
        {
          name: 'settings-general',
          title: 'menu.settings.general',
        },
      ],
    }
  ];
}
