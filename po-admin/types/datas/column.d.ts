import { ScopedSlot } from 'vue/types/vnode';

export type Column = {
  /**
   * specify how content is aligned
   * @default 'left'
   * @type string
   */
  align?: 'left' | 'right' | 'center';
  /**
   * ellipsize cell content, not working with sorter and filters for now.
   * tableLayout would be fixed when ellipsis is true.
   * @default false
   * @type boolean
   */
  ellipsis?: boolean;
  /**
   * Display field of the data record, could be set like a.b.c
   * @type string
   */
  dataIndex?: string;
  /**
   * Unique key of this column, you can ignore this prop if you've set a unique dataIndex
   * @type string
   */
  key?: string;
  /**
   * Renderer of the table cell. The return value should be a VNode, or an object for colSpan/rowSpan config
   * @type Function | ScopedSlot
   */
  customRender?: Function | ScopedSlot;
  /**
   * Title of this column
   * @type string
   */
  title: string;
  /**
   * Width of this column
   * @type string | number
   */
  width?: string | number;
  /**
   * Show this column in mobile width
   * @default false
   * @type boolean
   */
  showInMobile?: true;
  /**
   * Show this column in tablet width
   * @default false
   * @type boolean
   */
  showInTablet?: true;
};

export type CustomColumns = Column[] | ((i18nRender: (key: string, fallback: string) => string) => Column[]);
