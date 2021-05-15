import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';
import { get } from 'lodash-es';

// Types
import * as tsx from 'vue-tsx-support';
import { Table, PaginationConfig, TableRowSelection } from 'ant-design-vue/types/table/table';

export type DataSourceFn = (filter: {
  page: number;
  size: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => Promise<any>;

export type Alert =
  | {
      show: boolean;
      clear: (() => void) | true;
    }
  | boolean;

@Component({
  name: 'AsyncTable',
  inheritAttrs: false,
})
export default class AsyncTable extends Vue {
  _tsx!: tsx.DeclareProps<
    Partial<Table> &
      tsx.MakeOptional<
        tsx.PickProps<
          AsyncTable,
          | 'columns'
          | 'dataSource'
          | 'pageNum'
          | 'pageSize'
          | 'showSizeChanger'
          | 'alert'
          | 'showPagination'
          | 'rowsFieldName'
          | 'totolFieldName'
          | 'pageURI'
          | 'pageNoKey'
        >,
        | 'pageNum'
        | 'pageSize'
        | 'showSizeChanger'
        | 'alert'
        | 'showPagination'
        | 'rowsFieldName'
        | 'totolFieldName'
        | 'pageURI'
        | 'pageNoKey'
      >
  >;
  /** 列， 参考 https://antdv.com/components/table/#API */
  @Prop({ type: Array, required: true }) columns!: any;
  /** 数据源异步方法 */
  @Prop({ type: Function, required: true }) dataSource!: DataSourceFn;
  /** dataSource 返回数据字段 Promise<{[rowsFieldName]:Array,[totalFieldName]:Number}>  */
  @Prop({ type: String, default: 'rows' }) rowsFieldName!: string;
  /** dataSource 返回行数字段 Promise<{[rowsFieldName]:Array,[totalFieldName]:Number}>  */
  @Prop({ type: String, default: 'total' }) totolFieldName!: string;
  /** 页数 */
  @Prop({ type: Number, default: 1 }) pageNum!: number;
  /** 页大小 */
  @Prop({ type: Number, default: 10 }) pageSize!: number;
  /** 页大小是否可改变，参考 https://antdv.com/components/pagination/#API */
  @Prop({ type: Boolean, default: true }) showSizeChanger!: boolean;
  /** 显示分页，auto: hideOnSinglePage=true, ture: shown always, false: hide pagination */
  @Prop({ type: [String, Boolean], default: 'auto' }) showPagination!: 'auto' | boolean;
  /**
   * 启用分页 URI 模式
   * 例如:
   * /users/1
   * /users/2
   * /users/3?queryParam=test
   * /users?[pageNoKey]=1
   * ...
   */
  @Prop({ type: Boolean, default: false }) pageURI!: boolean;
  /** URI 模式下显示分页的 key */
  @Prop({ type: String, default: 'page' }) pageNoKey!: string;
  /**
   * 显示汇总(column 配置 needTotal)
   * 例如:
   * {
   *   show: true,
   *   clear: Function | true // 显示清空选项，或清空选项前执行的方法
   * } | true
   */
  @Prop({ type: [Object, Boolean], default: null }) alert!: Alert;

  needTotalList!: Array<{
    title: string | ((i18nRender: Function) => string);
    total: number;
    customRender?: Function;
    dataIndex: number;
  }>;
  selectedRows!: object[];
  selectedRowKeys!: Array<string | number>;
  localLoading!: boolean;
  localDataSource!: object[];
  localPagination!: boolean | PaginationConfig;

  data() {
    return {
      localLoading: false,
      localDataSource: [],
      localPagination: false, // create 里重新计算
    };
  }

  get showAlert() {
    if (this.alert === null) return false;

    const rowSelection = (this.$attrs.rowSelection as any) as TableRowSelection;
    return (
      this.alert === true ||
      (typeof this.alert === 'object' &&
        this.alert.show &&
        rowSelection &&
        typeof rowSelection.selectedRowKeys !== 'undefined')
    );
  }

  get localRowSelection(): TableRowSelection {
    const rowSelection = (this.$attrs.rowSelection as any) as TableRowSelection;
    if (this.showAlert && rowSelection) {
      // 如果需要使用alert，则重新绑定 rowSelection 事件
      return {
        ...rowSelection,
        selectedRowKeys: this.selectedRowKeys as any,
        onChange: (selectedRowKeys: Array<string | number>, selectedRows: object[]) => {
          this.updateSelect(selectedRowKeys, selectedRows);
          rowSelection.onChange && rowSelection.onChange(selectedRowKeys, selectedRows);
        },
      };
    } else {
      return rowSelection;
    }
  }

  get hasPagination() {
    return ['auto', true].includes(this.showPagination);
  }

  @Watch('localPagination.current')
  watchLocalPaginationCurrent(val: number) {
    this.$router &&
      this.pageURI &&
      this.$router.push({
        ...this.$route,
        name: this.$route.name!,
        params: Object.assign({}, this.$route.params, {
          [this.pageNoKey]: val,
        }),
      });
  }

  @Watch('pageNum')
  watchPageNum(val: number) {
    Object.assign(this.localPagination, {
      current: val,
    });
  }
  @Watch('pageSize')
  watchPageSize(val: number) {
    Object.assign(this.localPagination, {
      pageSize: val,
    });
  }

  @Watch('showSizeChanger')
  watchsshowSizeChanger(val: boolean) {
    Object.assign(this.localPagination, {
      showSizeChanger: val,
    });
  }

  /**
   * 加载数据方法
   * @param {Object} pagination 分页选项器
   * @param {Object} filters 过滤条件
   * @param {Object} sorter 排序条件
   */
  loadData(
    pagination?: PaginationConfig,
    filters?: Dictionary<any>,
    sorter?: { field?: string; order?: 'ASC' | 'DESC' },
  ) {
    this.localLoading = true;
    const params = Object.assign(
      {
        page:
          (pagination && pagination.current) ||
          (this.showPagination && typeof this.localPagination === 'object' && this.localPagination.current) ||
          this.pageNum,
        size:
          (pagination && pagination.pageSize) ||
          (this.showPagination && typeof this.localPagination === 'object' && this.localPagination.pageSize) ||
          this.pageSize,
      },
      (sorter && sorter.field && { sortField: sorter.field }) || {},
      (sorter && sorter.order && { sortOrder: sorter.order }) || {},
      { ...filters },
    );
    const result = this.dataSource(params);
    if ((typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {
      result
        .then((r: any) => {
          const rows = r[this.rowsFieldName] || [];
          const total = r[this.totolFieldName] || 0;
          this.localPagination =
            this.localPagination &&
            Object.assign({}, this.localPagination, {
              // current: r.pager.page, // 返回结果中的当前分页数
              total, // 返回结果中的总记录数
            });
          // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
          if (
            rows.length === 0 &&
            this.showPagination &&
            typeof this.localPagination === 'object' &&
            this.localPagination.current! > 1
          ) {
            this.localPagination.current!--;
            this.loadData();
            return;
          }

          this.localDataSource = rows; // 返回结果中的数组数据
        })
        .catch((err: Error) => {
          this.$error({ content: err.message });
        })
        .finally(() => {
          this.localLoading = false;
        });
    }
  }

  /**
   * 初始化需要统计汇总的列
   * @param columns
   */
  initTotalList(columns: any) {
    const totalList: any = [];
    Array.isArray(columns) &&
      columns.length &&
      columns.forEach((column) => {
        if (column.needTotal) {
          totalList.push({ ...column, total: 0 });
        }
      });
    return totalList;
  }

  /**
   * 表格重新加载方法
   * 如果参数为 true, 则强制刷新到第一页
   * @param Boolean bool
   */
  refresh(force = false) {
    force && (this.localPagination = Object.assign({}, this.localPagination, { current: 1 }));
    this.loadData();
  }

  /**
   * 用于更新已选中的列表数据 total 统计
   * @param selectedRowKeys
   * @param selectedRows
   */
  updateSelect(selectedRowKeys: Array<string | number>, selectedRows: object[]) {
    this.selectedRows = selectedRows;
    this.selectedRowKeys = selectedRowKeys;
    const list = this.needTotalList;
    this.needTotalList = list.map((item) => {
      return {
        ...item,
        total: selectedRows.reduce((sum, val) => {
          const total = sum + parseInt(get(val, item.dataIndex));
          return isNaN(total) ? 0 : total;
        }, 0),
      };
    });
  }

  /**
   * 清空 table 已选中项
   */
  handleClearSelected() {
    if (this.localRowSelection) {
      this.localRowSelection.onChange && this.localRowSelection.onChange([], []);
      this.updateSelect([], []);
    }
  }

  created() {
    // 处理分页显示
    let localPageNum = this.pageNum;
    // page num from URI
    if (this.$router && this.pageURI) {
      try {
        if (this.$route.params[this.pageNoKey]) {
          localPageNum = parseInt(this.$route.params[this.pageNoKey]);
        } else if (this.$route.query[this.pageNoKey]) {
          localPageNum = parseInt(this.$route.query[this.pageNoKey] as string);
        }
      } catch (err) {
        // ate by dog
      }
    }
    this.localPagination =
      this.hasPagination &&
      Object.assign({}, this.$attrs.pagination as any, {
        current: localPageNum,
        pageSize: this.pageSize,
        hideOnSinglePage: this.showPagination === 'auto',
        showSizeChanger: !!this.showSizeChanger,
      });

    this.needTotalList = this.initTotalList(this.columns);
    this.selectedRows = [];
    this.selectedRowKeys = [];
    this.loadData();
  }

  renderAlert() {
    // 绘制统计列数据
    const needTotalItems = this.needTotalList.map((item) => {
      return (
        <span style="margin-right: 12px">
          {typeof item.title === 'function' ? item.title(this.$tv.bind(this)) : item.title}
          {this.$tv('asyncTable.sum', ' Sum')}:&nbsp;
          <a style="font-weight: 600">{!item.customRender ? item.total : item.customRender(item.total)}</a>
        </span>
      );
    });

    // 绘制 清空 按钮
    let clearItem = null;
    if (typeof this.alert === 'object' && this.alert.clear) {
      const callback = typeof this.alert.clear === 'function' ? this.alert.clear : () => {};
      clearItem = renderClear.call(this, callback);
    }

    // 绘制 alert 组件
    return (
      <a-alert showIcon={true} style="margin-bottom: 16px;">
        <template slot="message">
          <span style="margin-right: 12px">
            {this.$tv('asyncTable.selected', 'Selected')}:&nbsp;
            <a style="font-weight: 600">{this.selectedRows.length}</a>
          </span>
          {needTotalItems}
          {clearItem}
        </template>
      </a-alert>
    );

    // 处理交给 table 使用者去处理 clear 事件时，内部选中统计同时调用
    function renderClear(this: InstanceType<typeof AsyncTable>, callback: () => void) {
      if (this.selectedRowKeys.length <= 0) return null;
      return (
        <a
          style="margin-left: 24px"
          onClick={() => {
            callback();
            this.handleClearSelected();
          }}
        >
          {this.$tv('asyncTable.clear', 'Clear')}
        </a>
      );
    }
  }

  render() {
    const props = {
      ...this.$attrs,
      columns: this.columns,
      dataSource: this.localDataSource,
      pagination: this.localPagination,
      loading: this.localLoading,
      // rowSelection: this.localRowSelection,
    };

    const listeners = {
      ...this.$listeners,
      change: this.loadData.bind(this),
    };

    return (
      <div class="table-wrapper">
        {this.showAlert ? this.renderAlert() : null}
        <a-table
          {...{
            props,
            on: listeners,
            scopedSlots: this.$scopedSlots,
          }}
        ></a-table>
      </div>
    );
  }
}
