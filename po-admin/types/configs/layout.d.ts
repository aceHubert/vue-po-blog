import { Layout, Theme, ContentWidth } from 'src/configs/settings.config';

export interface LayoutConfig {
  title: string;
  logo: any;
  layout: Layout;
  theme: Theme;
  primaryColor: string;
  contentWidth: ContentWidth;
  fixedHeader: boolean;
  fixSiderbar: boolean;
  colorWeak: boolean;
  autoHideHeader: false;
  multiTab: false;
}
