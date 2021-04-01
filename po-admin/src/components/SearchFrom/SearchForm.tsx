import { Vue, Component, Prop, Emit, Watch } from 'nuxt-property-decorator';
import classes from './SearchForm.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { Route } from 'vue-router';

export type StatusOption<Value = any> = {
  value: Value;
  label: string;
  count: number;
  keepStatusShown?: boolean; // 一直显示当前状态，默认在数量为 > 0 的时候才显示
};

export type BlukAcitonOption<Value = any> = {
  value: Value;
  label: string;
};

/**
 * query:{
 *  s: keywrod,
 *  status: status
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
      onPreFilters: (filters: { keyword?: string; [status: string]: any }) => void; // created 时从 router 我获取的参数
      onSearch: (filters: { keyword?: string; [status: string]: any }) => void;
      onBlukApply: (action: BlukAcitonOption['value']) => void;
    }>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    sub?: void; // 左上角区域（如状态选择有选项则不显示）
    filter?: void; // 批量修改后面(更多过滤条件)
    filterRight?: void; // 批量修改右侧（默认显示数据条数）
  }>;

  @Prop(String) keywordPlaceholder?: string; // keywork input placeholder
  @Prop({ type: String, default: 'status' }) statusName!: string; // 状态名字，显示到url query key 和 search 参数中 key, 默认：status
  @Prop({ type: Array, default: () => [] }) statusOptions!: StatusOption[]; // 默认选中值为 underfined 如果未能从 $route.query 中获取到选中参数
  @Prop({ type: Boolean, default: false }) keepStatusShown!: boolean; // 一直显示所有状态，默认在数量为 > 0 的时候才显示
  @Prop({ type: Array, default: () => [] }) blukAcitonOptions!: BlukAcitonOption[]; // 批量操作，如果没有选项则不显示
  @Prop(Boolean) blukApplying?: boolean; // apply 按纽 loading 状态
  @Prop(Number) itemCount?: number; // dataSource 行数量, 当 >0 时显示批量操作

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
    this.localeKeyword = query.s;
    this.localeStatus = query[this.statusName];
  }

  @Watch('localeStatus')
  watchLocalStatus() {
    this.$nextTick(() => {
      this.handleSearch();
    });
  }

  @Emit('search')
  handleSearch() {
    if (this.$router) {
      const query: Dictionary<any> = {
        s: this.localeKeyword,
        [this.statusName]: this.localeStatus,
      };

      const oldQuery = this.$route.query;
      const path = this.$route.path;
      // 对象的拷贝
      const newQuery = JSON.parse(JSON.stringify(oldQuery));
      this.$router.push({ path, query: { ...newQuery, ...query } });
    }
    return {
      keyword: this.localeKeyword,
      [this.statusName]: this.localeStatus,
    };
  }

  handleBlukAction() {
    if (this.blukAciton) {
      this.$emit('blukApply', this.blukAciton);
    }
  }

  created() {
    this.$emit('preFilters', {
      keyword: this.localeKeyword,
      [this.statusName]: this.localeStatus,
    });
  }

  render() {
    return (
      <div class={classes.searchFormWrapper}>
        {this.statusOptions.length ? (
          <ul class={classes.sub}>
            {this.statusOptions.map((option) =>
              option.keepStatusShown || this.keepStatusShown || option.count > 0 ? (
                <li class={classes.subItem}>
                  <nuxt-link
                    to={{ query: { ...this.$route.query, [this.statusName]: option.value } }}
                    class={{ active: option.value === this.localeStatus }}
                  >
                    {option.label}
                    {option.count > 0 ? <span>({option.count})</span> : null}
                  </nuxt-link>
                </li>
              ) : null,
            )}
          </ul>
        ) : this.$scopedSlots.sub ? (
          <div class={classes.subSlot}>{this.$scopedSlots.sub()}</div>
        ) : null}
        <a-form layout="inline" size="small" class={classes.searchForm}>
          <a-row>
            <a-col md={{ span: 16, offset: 8 }} sm={24}>
              <a-form-item class={classes.searchInput}>
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
            <a-row class={classes.filterRow}>
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
                  <a-form-item class={classes.itemCount}>
                    <span class={classes.itemCount}>
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
