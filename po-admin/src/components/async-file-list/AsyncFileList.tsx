import { Vue, Component, Prop } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
import { List, PaginationConfig } from 'ant-design-vue/types/list/list';

export type File = {
  fileName: string;
  extension: string;
  miniType: string;
  src?: string;
  metadata: {
    fileSize?: number;
    [key: string]: any;
  };
};

export type DataSourceFn = (filter: { page: number; size: number }) => Promise<File[]>;

@Component<AsyncFileList>({
  name: 'AsyncFileList',
})
export default class AsyncFileList extends Vue {
  _tsx!: tsx.DeclareProps<
    Partial<List> &
      tsx.MakeOptional<
        tsx.PickProps<
          AsyncFileList,
          | 'type'
          | 'grid'
          | 'dataSource'
          | 'rowsFieldName'
          | 'totolFieldName'
          | 'selectable'
          | 'pageNum'
          | 'pageSize'
          | 'showSizeChanger'
          | 'showPagination'
          | 'pageURI'
          | 'pageNoKey'
        >,
        | 'type'
        | 'rowsFieldName'
        | 'totolFieldName'
        | 'selectable'
        | 'pageNum'
        | 'pageSize'
        | 'showSizeChanger'
        | 'showPagination'
        | 'pageURI'
        | 'pageNoKey'
      >
  >;
  /** 显示方式 */
  @Prop({ type: String, default: 'grid' }) type!: 'list' | 'grid';
  /** 显示方式为 grid 时显示的列数 */
  @Prop({ type: Object }) grid?: List['grid'];
  /** 数据源异步方法 */
  @Prop({ type: Function, required: true }) dataSource!: DataSourceFn;
  /** dataSource 返回数据字段 Promise<{[rowsFieldName]:Array,[totalFieldName]:Number}>  */
  @Prop({ type: String, default: 'rows' }) rowsFieldName!: string;
  /** dataSource 返回行数字段 Promise<{[rowsFieldName]:Array,[totalFieldName]:Number}>  */
  @Prop({ type: String, default: 'total' }) totolFieldName!: string;
  /** 是否可选择 */
  @Prop({ type: Boolean, default: false }) selectable!: false;
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

  localLoading!: boolean;
  localDataSource!: File[];
  localPagination!: boolean | PaginationConfig;

  data() {
    return {
      localLoading: false,
      localDataSource: [],
      localPagination: false, // create 里重新计算
    };
  }

  get hasPagination() {
    return ['auto', true].includes(this.showPagination);
  }

  /**
   * 加载数据方法
   * @param {Object} pagination 分页选项器
   * @param {Object} filters 过滤条件
   * @param {Object} sorter 排序条件
   */
  loadData(pagination?: PaginationConfig, filters?: Dictionary<any>) {
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

  getImgUrlFromMimeType(mimeType: string) {
    // todo
    return mimeType;
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
    this.localPagination = Object.assign({}, this.$attrs.pagination as any, {
      current: localPageNum,
      pageSize: this.pageSize,
      hideOnSinglePage: this.showPagination === 'auto',
      showSizeChanger: !!this.showSizeChanger,
    });
  }

  renderListItme(item: File) {
    return (
      <a-list-item>
        <a-list-item-meta title={item.fileName}>
          <template slot="avatar">
            {item.miniType.startsWith('image/') ? (
              <img src={item.src} alt={item.fileName} />
            ) : (
              <img src={this.getImgUrlFromMimeType(item.miniType)} alt={item.fileName} />
            )}
          </template>
          <template slot="description">www.instagram.com</template>
        </a-list-item-meta>
        <a slot="actions">edit</a>
        <a slot="actions">more</a>
      </a-list-item>
    );
  }

  renderGridItem(item: File) {
    return (
      <a-list-item>
        <a-card style="width: 300px">
          {item.miniType.startsWith('image/') ? (
            <img src={item.src} alt={item.fileName} />
          ) : (
            <img src={this.getImgUrlFromMimeType(item.miniType)} alt={item.fileName} />
          )}
          <a-card-meta title={item.fileName}>
            <template slot="description">www.instagram.com</template>
          </a-card-meta>
        </a-card>
      </a-list-item>
    );
  }

  render() {
    const props = {
      ...this.$attrs,
      itemLayout: this.type === 'list' ? 'horizontal' : 'vertical',
      grid: this.grid || { gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 8 },
      dataSource: this.localDataSource,
      pagination: this.localPagination,
      loading: this.localLoading,
    };

    const listeners = {
      ...this.$listeners,
      // change: this.loadData.bind(this),
    };

    return (
      <div class="file-list-wrapper">
        <a-list
          {...{
            props,
            on: listeners,
            scopedSolts: {
              renderItem: (item: File) =>
                this.type === 'list' ? this.renderListItme(item) : this.renderGridItem(item),
            },
          }}
        ></a-list>
      </div>
    );
  }
}
