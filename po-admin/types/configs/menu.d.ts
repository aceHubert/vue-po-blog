import { UserCapability } from 'src/includes/datas';

/**
 * Menu
 */
export interface Menu {
  /**
   * vue-router name
   */
  name: string;
  /**
   * vue-router path, resolve from name if not set
   */
  path?: string;
  /**
   * title
   */
  title: string;
  /**
   * svg icon or antd icon type
   * https://1x.antdv.com/components/icon-cn/
   */
  icon: any;
  /**
   * open method
   */
  target?: '_blank' | '_self';
  /**
   * 1、no checking when it does not set any capability
   * 2、children will be invisible when parent has not capability
   */
  capabilities?: UserCapability[];
  /**
   * parent will be invisible when there is no children
   */
  children?: Array<Omit<Menu, 'icon' | 'children'>>;
}
