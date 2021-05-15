import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
import { Route } from 'vue-router';

/**
 * 状态配置
 * 当 value 为 object 时，key 为 URI query key
 * 每一项是平等关系
 * 例如：
 * [
 * {value:1} // ?[statusName]=1
 * {value:{author:2,type:post}} // ?author=2&type=post
 * ]
 */
export type StatusOption = {
  value: string | number | undefined | Dictionary<string | number>;
  label: string;
  count: number;
  /** 一直显示当前状态(option.keepStatusShown, prop.keepStatusShown, count > 0 任一条件满足即显示)，默认：false */
  keepStatusShown?: boolean;
};

/**
 * 批量操作配置
 */
export type BlukAcitonOption = {
  value: string | number;
  label: string;
};

/**
 * 路由初始化参数
 * query:{
 *  [keyword]: keywrod,
 *  [status]: status
 * }
 */

@Component<SearchFrom>({
  name: 'SearchFrom',
})
export default class SearchFrom extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<
      tsx.PickProps<
        SearchFrom,
        | 'keywordPlaceholder'
        | 'statusName'
        | 'statusOptions'
        | 'keepStatusShown'
        | 'blukAcitonOptions'
        | 'blukApplying'
        | 'itemCount'
      >,
      'statusName' | 'statusOptions' | 'keepStatusShown' | 'blukAcitonOptions'
    >
  > &
    tsx.DeclareOnEvents<{
      /** 关键字输入框的查询或都状态（如有配置）点击之后 */
      onSearch: (filters: Dictionary<string | number>) => void;
      /** 批量操作 */
      onBlukApply: (action: string | number) => void;
    }>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 左上角区域（如 statusOptions 有选项则不显示） */
    sub?: void;
    /** 批量修改后面(更多过滤条件) */
    filter?: void;
    /** 批量修改右侧（默认显示数据行数，如赋值则不显示行数） */
    filterRight?: void;
  }>;

  /**  keyword input placeholder */
  @Prop(String) keywordPlaceholder?: string;
  /** 关键字名字，显示到 URI query 中的 key, 默认：keyword */
  @Prop({ type: String, default: 'keyword' }) keywordName!: string;
  /** 状态名字，显示到 URI query 中的 key, 默认：status */
  @Prop({ type: String, default: 'status' }) statusName!: string;
  /** 左上角状态搜索链接配置 */
  @Prop({ type: Array, default: () => [] }) statusOptions!: StatusOption[];
  /** 一直显示所有状态（statusOptions 中的配置会抵消），默认：count > 0 的时候才显示 */
  @Prop({ type: Boolean, default: false }) keepStatusShown!: boolean;
  /** 批量操作，如果没有选项则不显示 */
  @Prop({ type: Array, default: () => [] }) blukAcitonOptions!: BlukAcitonOption[];
  /** apply 按纽 loading 状态 */
  @Prop(Boolean) blukApplying?: boolean;
  /** dataSource 行数（显示在表格的右上角）, 当 >0 时显示批量操作, 当scopedSlots.filterRight 有设置时，右上角行数不显示 */
  @Prop(Number) itemCount?: number;

  localeKeyword?: string;
  localeStatus?: StatusOption['value'];
  blukAciton!: string;

  data() {
    return {
      localeKeyword: '',
      localeStatus: undefined,
      blukAciton: '',
    };
  }

  @Watch('$route', { immediate: true })
  watchRoute(val: Route) {
    const query = val.query as Dictionary<string>;
    this.localeKeyword = query[this.keywordName] || '';
    this.localeStatus = query[this.statusName];
  }

  @Watch('localeStatus')
  watchLocalStatus() {
    this.$nextTick(() => {
      this.$emit('search', {
        [this.keywordName]: this.localeKeyword,
        [this.statusName]: this.localeStatus,
      });
    });
  }

  getStatusUrl(option: StatusOption) {
    const query: Dictionary<string> = {};
    if (typeof option.value === 'object') {
      Object.entries(option.value).forEach(([key, value]) => {
        query[key] = String(value);
      });
    } else if (option.value) {
      query[this.statusName] = String(option.value);
    }
    return { query };
  }

  handleSearch() {
    const query: Dictionary<any> = {
      [this.keywordName]: this.localeKeyword || undefined,
    };

    const oldQuery = this.$route.query;
    const path = this.$route.path;
    // 对象的拷贝
    const newQuery = Object.assign(JSON.parse(JSON.stringify(oldQuery)), query);
    // 移附 undefined 值
    for (const key in newQuery) {
      if (typeof newQuery[key] === 'undefined') {
        delete newQuery[key];
      }
    }

    // nuxtjs 重写了push 方法，无法调用Promise
    this.$router.replace({ path, query: newQuery }, () => {
      this.$emit('search', {
        [this.keywordName]: this.localeKeyword,
        [this.statusName]: this.localeStatus,
      });
    });
  }

  handleBlukAction() {
    if (this.blukAciton) {
      this.$emit('blukApply', this.blukAciton);
    }
  }

  render() {
    return (
      <div class="po-search">
        {this.statusOptions.length ? (
          <ul class="po-search-sub">
            {this.statusOptions.map((option) =>
              option.keepStatusShown || this.keepStatusShown || option.count > 0 ? (
                <li class="po-search-sub__item">
                  <nuxt-link to={this.getStatusUrl(option)} activeClass="" exactActiveClass="active" exact replace>
                    {option.label}
                    {option.count > 0 ? <span>({option.count})</span> : null}
                  </nuxt-link>
                </li>
              ) : null,
            )}
          </ul>
        ) : this.$scopedSlots.sub ? (
          <div class="po-search-sub-slot">{this.$scopedSlots.sub()}</div>
        ) : null}
        <a-form layout="inline" size="small" class="po-search-form">
          <a-row>
            <a-col md={{ span: 16, offset: 8 }} sm={24}>
              <a-form-item class="po-search-form__input-item">
                <a-input-search
                  vModel={this.localeKeyword}
                  placeholder={this.keywordPlaceholder || this.$tv('searchForm.keywordPlaceholder', 'Keyword')}
                  onSearch={this.handleSearch.bind(this)}
                />
              </a-form-item>
            </a-col>
          </a-row>
          {this.blukAcitonOptions.length ||
          this.itemCount ||
          this.$scopedSlots.filter ||
          this.$scopedSlots.filterRight ? (
            <a-row class="po-search-form__filter-row">
              <a-col md={16} xs={24}>
                <a-space size="middle" style="flex-wrap: wrap;">
                  {this.itemCount && this.itemCount > 0 ? (
                    <a-form-item>
                      <a-space>
                        <a-select vModel={this.blukAciton} style="min-width:120px;">
                          <a-select-option value="">
                            {this.$tv('searchForm.bulkActionPlaceholder', 'Bulk actions')}
                          </a-select-option>
                          {this.blukAcitonOptions.map((option) => (
                            <a-select-option value={option.value}>{option.label}</a-select-option>
                          ))}
                        </a-select>
                        <a-button
                          ghost
                          type="primary"
                          loading={this.blukApplying}
                          title={this.$tv('searchForm.bulkApplyBtnTitle', 'Apply')}
                          onClick={this.handleBlukAction.bind(this)}
                        >
                          {this.$tv('searchForm.bulkApplyBtnText', 'Apply')}
                        </a-button>
                      </a-space>
                    </a-form-item>
                  ) : null}
                  <a-form-item>
                    <a-space>{this.$scopedSlots.filter ? this.$scopedSlots.filter() : null}</a-space>
                  </a-form-item>
                </a-space>
              </a-col>
              <a-col md={8} xs={24}>
                {this.$scopedSlots.filterRight ? (
                  <a-space size="middle" style="flex-wrap: wrap;">
                    {this.$scopedSlots.filterRight()}
                  </a-space>
                ) : this.itemCount ? (
                  <a-form-item class="po-search-from__count-item">
                    <span>
                      {this.$tv('searchForm.itemCount', `${this.itemCount} Items`, { count: this.itemCount })}
                    </span>
                  </a-form-item>
                ) : null}
              </a-col>
            </a-row>
          ) : null}
        </a-form>
      </div>
    );
  }
}
