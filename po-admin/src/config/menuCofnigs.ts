/**
 * 默认左侧菜单配置
 */
import { dashboard, page, post, image, theme, plugin, user, tool, setting } from '@/assets/icons';

// Types
import { Menu } from 'types/functions';

export function getDefaultMenus(i18nRender: (key: string, fallback: string) => string): Menu[] {
  return [
    {
      name: 'dashboard',
      title: i18nRender('menu.dashboard', 'Dashboard'),
      icon: dashboard,
    },
    {
      name: 'posts',
      title: i18nRender('menu.post.root', 'Posts'),
      icon: post,
      children: [
        {
          name: 'posts',
          title: i18nRender('menu.post.posts', 'All Posts'),
        },
        {
          name: 'posts-create',
          title: i18nRender('menu.post.create', 'Add New'),
        },
        {
          name: 'tags',
          title: i18nRender('menu.post.tags', 'All Tags'),
        },
        {
          name: 'categories',
          title: i18nRender('menu.post.categories', 'All Categories'),
        },
      ],
    },
    {
      name: 'medias',
      title: i18nRender('menu.media.root', 'Media'),
      icon: image,
      children: [
        {
          name: 'medias',
          title: i18nRender('menu.media.medias', 'All Medias'),
        },
        {
          name: 'medias-create',
          title: i18nRender('menu.media.create', 'Add New'),
        },
      ],
    },
    {
      name: 'pages',
      title: i18nRender('menu.page.root', 'Pages'),
      icon: page,
      children: [
        {
          name: 'pages',
          title: i18nRender('menu.page.pages', 'All Pages'),
        },
        {
          name: 'pages-create',
          title: i18nRender('menu.page.create', 'Add New'),
        },
      ],
    },
    {
      name: 'themes',
      title: i18nRender('menu.theme.root', 'Appearance'),
      icon: theme,
      children: [
        {
          name: 'themes',
          title: i18nRender('menu.theme.libs', 'Themes'),
        },
        {
          name: 'themes-customize',
          title: i18nRender('menu.theme.customize', 'Customize'),
        },
        {
          name: 'themes-widgets',
          title: i18nRender('menu.theme.widgets', 'Widgets'),
        },
        {
          name: 'themes-menu',
          title: i18nRender('menu.theme.menu', 'Menu'),
        },
      ],
    },
    {
      name: 'plugins-installed',
      title: i18nRender('menu.plugin.root', 'Plugins'),
      icon: plugin,
      children: [
        {
          name: 'plugins-installed',
          title: i18nRender('menu.plugin.installed', 'Installed Plugins'),
        },
        {
          name: 'plugins',
          title: i18nRender('menu.plugin.add', 'Install Plugin'),
        },
      ],
    },
    {
      name: 'users',
      title: i18nRender('menu.user.root', 'User'),
      icon: user,
      children: [
        {
          name: 'users',
          title: i18nRender('menu.user.users', 'All Users'),
        },
        {
          name: 'users-create',
          title: i18nRender('menu.user.create', 'Add New'),
        },
      ],
    },
    {
      name: 'tools',
      title: i18nRender('menu.tools.root', 'Tools'),
      icon: tool,
      children: [
        {
          name: 'tools-import',
          title: i18nRender('menu.tools.import', 'Import'),
        },
        {
          name: 'tools-export',
          title: i18nRender('menu.tools.export', 'Export'),
        },
      ],
    },
    {
      name: 'settings',
      title: i18nRender('menu.settings.root', 'Settings'),
      icon: setting,
      children: [
        {
          name: 'settings-general',
          title: i18nRender('menu.settings.general', 'General'),
        },
      ],
    },
  ];
}
