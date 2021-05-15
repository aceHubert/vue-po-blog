/**
 * 默认左侧菜单配置
 */
import { dashboard, page, post, image, theme, plugin, user, tool, setting } from '@/assets/icons';
import { UserCapability } from '@/includes/datas';

// Types
import { Menu } from 'types/configs/menu';

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
      capabilities: [UserCapability.EditPosts],
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
          capabilities: [UserCapability.ManageTags],
        },
        {
          name: 'categories',
          title: i18nRender('menu.post.categories', 'All Categories'),
          capabilities: [UserCapability.ManageCategories],
        },
      ],
    },
    {
      name: 'medias',
      title: i18nRender('menu.media.root', 'Media'),
      icon: image,
      capabilities: [UserCapability.EditFiles],
      children: [
        {
          name: 'medias',
          title: i18nRender('menu.media.medias', 'All Medias'),
          capabilities: [UserCapability.EditFiles],
        },
        {
          name: 'medias-create',
          title: i18nRender('menu.media.create', 'Add New'),
          capabilities: [UserCapability.UploadFiles],
        },
      ],
    },
    {
      name: 'pages',
      title: i18nRender('menu.page.root', 'Pages'),
      icon: page,
      capabilities: [UserCapability.EditPages],
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
      capabilities: [UserCapability.EditThemeOptions],
      children: [
        {
          name: 'themes',
          title: i18nRender('menu.theme.libs', 'Themes'),
          capabilities: [
            UserCapability.InstallThemes,
            UserCapability.UploadPlugins,
            UserCapability.SwitchThemes,
            UserCapability.UpgradeThemes,
            UserCapability.DeleteThemes,
          ],
        },
        {
          name: 'themes-customize',
          title: i18nRender('menu.theme.customize', 'Customize'),
          capabilities: [UserCapability.Customize],
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
      capabilities: [UserCapability.InstallPlugins, UserCapability.UploadPlugins, UserCapability.DeletePlugins],
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
      capabilities: [UserCapability.ListUsers],
      children: [
        {
          name: 'users',
          title: i18nRender('menu.user.users', 'All Users'),
          capabilities: [UserCapability.ListUsers],
        },
        {
          name: 'users-create',
          title: i18nRender('menu.user.create', 'Add New'),
          capabilities: [UserCapability.EditUsers],
        },
      ],
    },
    {
      name: 'tools',
      title: i18nRender('menu.tools.root', 'Tools'),
      icon: tool,
      capabilities: [UserCapability.Export, UserCapability.Import],
      children: [
        {
          name: 'tools-import',
          title: i18nRender('menu.tools.import', 'Import'),
          capabilities: [UserCapability.Import],
        },
        {
          name: 'tools-export',
          title: i18nRender('menu.tools.export', 'Export'),
          capabilities: [UserCapability.Export],
        },
      ],
    },
    {
      name: 'settings',
      title: i18nRender('menu.settings.root', 'Settings'),
      icon: setting,
      capabilities: [UserCapability.ManageOptions],
      children: [
        {
          name: 'settings-general',
          title: i18nRender('menu.settings.general', 'General'),
        },
      ],
    },
  ];
}
