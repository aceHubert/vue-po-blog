import { Vue, Component, Watch, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { snakeCase } from 'lodash-es';
import { trailingSlash } from '@/utils/path';
import { AsyncTable, SearchForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { PostCommentStatus, PostStatus, UserCapability } from '@/includes/datas';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { Post, PostPagedQuery, PostPagedResponse, Term } from 'types/datas';
import { DataSourceFn } from '@/components/async-table/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/search-form/SearchForm';

enum BlukActions {
  MoveToTrash = 'moveToTrash',
  Restore = 'restore',
}

{
  /* <router>
{
  prop:true,
  meta:{
    title: 'All Posts',
    keepAlive: true,
  }
}
</router> */
}

/**
 * query:{
 *  keywork,
 *  status,
 *  cid: categoryId,
 *  cname: categoryName, // cid, cname 不可以同时出现，cid优先
 *  tag: tagName,
 *  date: YYYYMM,
 *  author: authorId,
 * }
 */
@Component<PostIndex>({
  name: 'PostIndex',
  meta: {
    capabilities: [UserCapability.EditPosts],
  },
  asyncData({ error, $i18n, graphqlClient }) {
    // 获取分类
    return graphqlClient
      .query<{
        categories: Term[];
        statusCounts: Array<{ status: PostStatus; count: number }>;
        monthCounts: Array<{ month: string; count: number }>;
        selfPostCount: number;
      }>({
        query: gql`
          query getFilters {
            categories: terms(taxonomy: "category") {
              id
              taxonomyId
              name
              parentId
            }
            statusCounts: postCountByStatus {
              status
              count
            }
            selfPostCount: postCountBySelf
            monthCounts: postCountByMonth {
              month
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        return {
          statusCounts: data.statusCounts,
          selfPostCount: data.selfPostCount,
          allCategories: data.categories,
          allMonths: data.monthCounts,
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({
          statusCode: statusCode || 500,
          message: $i18n.tv(`core.error.${statusCode}`, message) as string,
        });
      });
  },
})
export default class PostIndex extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  selectedRowKeys!: string[];
  statusCounts!: Array<{ status: PostStatus; count: number }>;
  selfPostCount!: number;
  allCategories!: Term[];
  allMonths!: Array<{ month: string; count: number }>;
  itemCount!: number;
  categoryId!: string;
  date!: string;
  blukApplying!: boolean;

  data() {
    const query = this.$route.query as Dictionary<string | null>;
    return {
      selectedRowKeys: [],
      statusCounts: [],
      selfPostCount: 0,
      allCategories: [],
      allMonths: [],
      categoryId: query.cid ? query.cid : '',
      date: query.d && query.d.length === 6 ? query.d : '', // yyyyMM
      itemCount: 0,
      blukApplying: false,
    };
  }

  // 所有列配置。 动态计算，title 配置有多语言
  get columns() {
    return table({ i18nRender: (key, fallback) => this.$tv(key, fallback) }).columns;
  }

  // 动态计算，当是手机端时只显示第一列
  get fixedColumns() {
    if (this.isMobile) {
      return this.columns.filter((column) => column.hideInMobile !== true);
    }
    return this.columns;
  }

  // 从 URI 获取搜索状态，并判断值的正确性
  get searchStatus() {
    const status = this.$route.query['status'] as PostStatus | undefined;
    return status && Object.values(PostStatus).includes(status) ? status : undefined;
  }

  // 从 URI 获取搜索条件，并判断值的正确性
  get searchQuery() {
    const query: Omit<PostPagedQuery, 'offset' | 'limit'> = {
      keyword: this.$route.query['keyword'] as string,
      status: this.searchStatus,
    };
    const author = this.$route.query['author'] as string | undefined;
    const date = this.$route.query['date'] as string | undefined;
    const categoryId = this.$route.query['cid'] as string | undefined;
    const categoryName = this.$route.query['cname'] as string | undefined;
    const tagName = this.$route.query['tag'] as string | undefined;
    if (author) {
      try {
        query.author = parseInt(author);
      } catch {
        return undefined;
      }
    }
    query.date = date?.length === 6 ? date : undefined;
    if (categoryId) {
      query.categoryId = categoryId;
    } else if (categoryName) {
      query.categoryName = categoryName;
    } else if (tagName) {
      query.tagName = tagName;
    }
    return query;
  }

  // 状态选项 添加 All 选项
  get statusOptions(): StatusOption[] {
    // 总数不记录 trash 状态
    const allCount = this.statusCounts.reduce((prev, curr) => {
      return prev + (curr.status === PostStatus.Trash ? 0 : curr.count);
    }, 0);

    const trushCount = this.statusCounts.find((item) => item.status === PostStatus.Trash)?.count || 0;

    const options: StatusOption[] = [
      {
        value: undefined,
        label: this.$tv('core.page-post.status.all', 'All') as string,
        count: allCount,
        keepStatusShown: true,
      },
      ...this.statusCounts.map(({ status, count }) => ({
        value: status,
        label: this.$tv(`core.page-post.status.${snakeCase(status)}`, status) as string,
        count,
      })),
    ];

    if (this.selfPostCount - trushCount !== allCount) {
      options.splice(1, 0, {
        value: { author: userStore.id! },
        label: this.$tv('core.page-post.status.self', 'Mine') as string,
        count: this.selfPostCount,
      });
    }
    return options;
  }

  // a-tree-select treeData 同步加载, 添加 All 选项
  get categoryOptions(): Array<{ id: string; pId?: string; title: string; value: string; isLeaf?: boolean }> {
    return [
      {
        id: '',
        value: '',
        title: this.$tv('core.page-post.search.all_categories', 'All Categories') as string,
        isLeaf: true,
      },
      ...this.allCategories.map(({ id, taxonomyId, name, parentId }) => ({
        id: taxonomyId,
        pId: parentId === '0' ? undefined : parentId,
        value: id,
        title: name,
      })),
    ];
  }

  // a-select options, 添加 All 选项
  get dateOptions(): Array<{ value: string; label: string }> {
    return [
      {
        value: '',
        label: this.$tv('core.page-post.search.all_dates', 'All Dates') as string,
      },
      ...this.allMonths.map(({ month }) => ({
        value: month,
        label: `${month.substr(0, 4)}-${month.substr(5)}`,
      })),
    ];
  }

  // 批量操作
  get blukActionOptions(): BlukAcitonOption[] {
    return this.searchStatus === PostStatus.Trash
      ? [
          {
            value: BlukActions.Restore,
            label: this.$tv('core.page-post.search.bulk_restore_action', 'Restore') as string,
          },
        ]
      : [
          {
            value: BlukActions.MoveToTrash,
            label: this.$tv('core.page-post.search.bulk_trash_action', 'Move To Trash') as string,
          },
        ];
  }

  @Watch('$route')
  watchRoute() {
    this.refreshTable();
  }

  // 加载 table 数据
  loadData({ page, size }: Parameters<DataSourceFn>[0]) {
    const query: PostPagedQuery = {
      ...this.searchQuery,
      offset: (page - 1) * size,
      limit: size,
    };
    return this.graphqlClient
      .query<{ posts: PostPagedResponse }, PostPagedQuery>({
        query: gql`
          query getPosts(
            $keyword: String
            $status: POST_STATUS
            $categoryId: ID
            $categoryName: String
            $tagName: String
            $date: String
            $limit: Int
            $offset: Int
          ) {
            posts(
              keyword: $keyword
              status: $status
              categoryId: $categoryId
              categoryName: $categoryName
              tagName: $tagName
              date: $date
              limit: $limit
              offset: $offset
            ) {
              rows {
                id
                title
                excerpt
                status
                commentStatus
                commentCount
                author {
                  id
                  displayName
                }
                categories {
                  id
                  name
                }
                tags {
                  id
                  name
                }
                createTime: createdAt
              }
              total
            }
          }
        `,
        variables: query,
      })
      .then(({ data }) => {
        this.itemCount = data.posts.total;
        return data.posts;
      })
      .catch((err) => {
        const { message } = formatError(err);
        throw new Error(message);
      });
  }

  // 刷新状态数量
  refreshStatusCounts() {
    return this.graphqlClient
      .query<{ statusCounts: Array<{ status: PostStatus; count: number }> }>({
        query: gql`
          query getStatusCounts {
            statusCounts: postCountByStatus {
              status
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        this.statusCounts = data.statusCounts;
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        this.$message.error(this.$tv(`core.error.${statusCode}`, message) as string);
      });
  }

  // 刷新 table, 会调用loadDate
  refreshTable() {
    this.table.refresh();
  }

  // 获取预览链接（草稿状态）
  getPreviewUrl(id: string) {
    if (process.client) {
      return `${trailingSlash(this.$userOptions['home'])}/${id}`;
    }
    return '#none';
  }

  // 获取显示链接（发布状态）
  getViewUrl(id: string) {
    if (process.client) {
      return `${trailingSlash(this.$userOptions['home'])}/${id}`;
    }
    return '#none';
  }

  // 编辑权限
  hasEditCapability(post: Post) {
    if (!this.hasCapability(UserCapability.EditOthersPosts) && post.author.id !== userStore.id) {
      return false;
    } else if (
      !this.hasCapability(UserCapability.EditPublishedPosts) &&
      (post.status === PostStatus.Publish || post.status === PostStatus.Private)
    ) {
      return false;
    }
    // UserCapability.EditPrivatePosts private 在接口返回时就过滤掉了
    return true;
  }

  // 删除权限
  hasDeleteCapability(post: Post) {
    if (!this.hasCapability(UserCapability.DeleteOthersPosts) && post.author.id !== userStore.id) {
      return false;
    } else if (
      !this.hasCapability(UserCapability.DeletePublishedPosts) &&
      (post.status === PostStatus.Publish || post.status === PostStatus.Private)
    ) {
      return false;
    }
    // UserCapability.EditPrivatePosts private 在接口返回时就过滤掉了
    return true;
  }

  // filter 按纽
  handleFilter() {
    this.updateRouteQuery(
      {
        cid: this.categoryId || undefined,
        cname: undefined,
        tag: undefined,
        date: this.date || undefined,
      },
      { replace: true },
    );
  }

  // 批量操作
  handleBlukApply(action: string | number) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({
        content: this.$tv('core.page-post.tips.bulk_row_reqrired', 'Please choose a row!') as string,
      });
      return;
    }
    if (action === BlukActions.MoveToTrash || action === BlukActions.Restore) {
      this.blukApplying = true;
      this.graphqlClient
        .mutate<{ result: boolean }, { ids: string[] }>({
          mutation:
            action === BlukActions.MoveToTrash
              ? gql`
                  mutation blukModifyStatus($ids: [ID!]!) {
                    result: blukUpdatePostOrPageStatus(ids: $ids, status: Trash)
                  }
                `
              : gql`
                  mutation blukRestore($ids: [ID!]!) {
                    result: blukRestorePostOrPage(ids: $ids)
                  }
                `,
          variables: {
            ids: this.selectedRowKeys,
          },
        })
        .then(({ data }) => {
          if (data?.result) {
            this.selectedRowKeys = [];
            this.refreshStatusCounts();
            this.refreshTable();
          }
        })
        .catch((err) => {
          const { message } = formatError(err);
          this.$message.error(message);
        })
        .finally(() => {
          this.blukApplying = false;
        });
    }
  }

  // 行选择
  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  // 修改状态
  handleModifyStatus(id: string, status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation updateStatus($id: ID!, $status: POST_STATUS!) {
            result: updatePostOrPageStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id,
          status,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 重置
  handleRestore(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation restorePostOrPage($id: ID!) {
            result: restorePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 删除
  handleDelete(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deletePost($id: ID!) {
            result: deletePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  render() {
    const $filters = this.$options.filters!;

    const getTitle = (dataIndex: string) => {
      return (this.columns as Array<{ title: string; dataIndex: string }>).find(
        (column) => column.dataIndex === dataIndex,
      )?.title;
    };

    // 在全部状态下时区分每一条的状态显示
    const getStatusText = (post: Post) => {
      if (!this.searchStatus) {
        if (post.status === PostStatus.Draft) {
          return this.$tv('core.page-post.status.draft', 'Draft');
        } else if (post.status === PostStatus.Trash) {
          return this.$tv('core.page-post.status.trash', 'Trash');
        } else if (post.status === PostStatus.Private) {
          return this.$tv('core.page-post.status.private', 'Private');
        } else if (post.status === PostStatus.Pending) {
          return post.author.id === userStore.id
            ? this.$tv('core.page-post.status.review', 'Review')
            : this.$tv('core.page-post.status.pending', 'Pending');
        }
      }
      return;
    };

    // 行Checkbox状态
    const getCheckboxProps = (record: Post) => {
      return {
        props: {
          disabled: !this.hasEditCapability(record) || !this.hasDeleteCapability(record),
        },
      };
    };

    const renderActions = (record: Post) => {
      const actions = (record.status === PostStatus.Trash
        ? [
            this.hasEditCapability(record) ? (
              <a
                href="#none"
                title={this.$tv('core.page-post.btn_tips.restore', 'Restore this post') as string}
                onClick={m.stop.prevent(this.handleRestore.bind(this, record.id))}
              >
                {this.$tv('core.page-post.btn_text.restore', 'Restore')}
              </a>
            ) : null,
            this.hasDeleteCapability(record) ? (
              <a-popconfirm
                title={this.$tv('core.page-post.tips.delete_pop_content', 'Do you really want to delete this post?')}
                okText={this.$tv('core.page-post.btn_text.delete_pop_ok_text', 'Ok')}
                cancelText={this.$tv('core.page-post.btn_text.delete_pop_cancel_text', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a
                  href="#none"
                  title={this.$tv('core.page-post.btn_tips.delete', 'Delete this post permanently') as string}
                >
                  {this.$tv('core.page-post.btn_text.delete', 'Delete Permanently')}
                </a>
              </a-popconfirm>
            ) : null,
          ]
        : [
            this.hasEditCapability(record) ? (
              <nuxt-link
                to={{ name: 'posts-edit', params: { id: String(record.id) } }}
                title={this.$tv('core.page-post.btn_tips.edit', 'Edit') as string}
              >
                {this.$tv('core.page-post.btn_text.edit', 'Edit')}
              </nuxt-link>
            ) : null,
            this.hasDeleteCapability(record) ? (
              <a
                href="#none"
                title={this.$tv('core.page-post.btn_tips.move_to_trash', 'Move to trash') as string}
                onClick={m.stop.prevent(this.handleModifyStatus.bind(this, record.id, PostStatus.Trash))}
              >
                {this.$tv('core.page-post.btn_text.move_to_trash', 'Trash')}
              </a>
            ) : null,
            record.status === PostStatus.Draft ? (
              this.hasEditCapability(record) ? (
                <a
                  href={this.getPreviewUrl(record.id)}
                  title={this.$tv('core.page-post.btn_tips.preview', 'Preview this post') as string}
                >
                  {this.$tv('core.page-post.btn_text.preview', 'Preview')}
                </a>
              ) : null
            ) : (
              <a
                href={this.getViewUrl(record.id)}
                title={this.$tv('core.page-post.btn_tips.view', 'View this post') as string}
              >
                {this.$tv('core.page-post.btn_text.view', 'View')}
              </a>
            ),
          ]
      ).filter(Boolean);
      return (
        <div class={classes.actions}>
          {actions.map((item, index) => (index === actions.length - 1 ? item : [item, <a-divider type="vertical" />]))}
        </div>
      );
    };

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        titles: (text: Post['title'], record: Post & { expand?: boolean }) => (
          <div class={[classes.columnTitle]}>
            <p class={[classes.title]}>
              <span class="text-ellipsis" style="max-width:180px;display:inline-block;">
                {text}
              </span>
              {getStatusText(record) ? (
                <span class="font-weight-bold ml-2" style="vertical-align: top;">
                  - {getStatusText(record)}
                </span>
              ) : null}
              <a-icon
                type={record.expand ? 'up-circle' : 'down-circle'}
                class="grey--text"
                onClick={() => {
                  this.$set(record, 'expand', !record.expand);
                }}
              ></a-icon>
            </p>

            {this.isMobile ? (
              <div class={[classes.content]} v-show={record.expand}>
                <p>
                  <span>{getTitle('author') || 'Author'}: </span>
                  {record.author ? (
                    <nuxt-link
                      to={{
                        query: Object.assign(this.$route.query, { author: record.author.id }),
                      }}
                      title={this.$tv('core.page-post.btn_tips.edit', 'Edit') as string}
                    >
                      {record.author.displayName}
                    </nuxt-link>
                  ) : (
                    '-'
                  )}
                </p>
                <p>
                  <span>{getTitle('commentCount') || 'Comment Count'}: </span>
                  {record.commentStatus === PostCommentStatus.Enable ? record.commentCount : '-'}
                </p>
                <p>
                  <span>{getTitle('createTime') || 'CreateTime'}: </span>
                  {$filters.dateFormat(record.createTime)}
                </p>
              </div>
            ) : null}
            {renderActions(record)}
          </div>
        ),
        author: (text: Post['author']) =>
          text ? (
            <nuxt-link
              to={{
                query: { author: text.id },
              }}
              title={this.$tv('core.page-post.btn_tips.edit', 'Edit') as string}
            >
              {text.displayName}
            </nuxt-link>
          ) : (
            '-'
          ),
        commentCount: (text: string, record: Post) => (record.commentStatus === PostCommentStatus.Enable ? text : '-'),
        categories: (text: Post['categories']) =>
          text.length
            ? text.map((item) => (
                <nuxt-link
                  to={{
                    query: { cname: item.name },
                  }}
                >
                  {item.name}
                </nuxt-link>
              ))
            : '-',
        tags: (text: Post['tags']) =>
          text.length
            ? text.map((item) => (
                <nuxt-link
                  to={{
                    query: { tag: item.name },
                  }}
                >
                  {item.name}
                </nuxt-link>
              ))
            : '-',
        createTime: (text: string) => $filters.dateFormat(text),
      } as any;
    };

    return (
      <a-card class="post-index" bordered={false}>
        <SearchForm
          keywordPlaceholder={this.$tv('core.page-post.search.keyword_placeholder', 'Search Posts') as string}
          itemCount={this.itemCount}
          statusOptions={this.statusOptions}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="filter">
            <a-select
              vModel={this.date}
              options={this.dateOptions}
              placeholder={this.$tv('core.page-post.search.choose_date', 'Choose date')}
              style="min-width:100px;"
            ></a-select>
            <a-tree-select
              vModel={this.categoryId}
              treeDataSimpleMode
              treeData={this.categoryOptions}
              placeholder={this.$tv('core.page-post.search.choose_category', 'Choose category')}
              style="min-width:120px;"
            ></a-tree-select>
            <a-button ghost type="primary" onClick={this.handleFilter.bind(this)}>
              {this.$tv('core.page-post.search.filter_btn_text', 'Filter')}
            </a-button>
          </template>
        </SearchForm>
        <AsyncTable
          ref="table"
          rowKey="id"
          size="small"
          scroll={{ x: true, y: 0 }}
          columns={this.fixedColumns}
          dataSource={this.loadData.bind(this)}
          showPagination="auto"
          rowSelection={{
            selectedRowKeys: this.selectedRowKeys,
            getCheckboxProps: getCheckboxProps.bind(this),
            onChange: this.handleSelectChange.bind(this),
          }}
          rowClassName={() => classes.tableRow}
          {...{
            scopedSlots: scopedSolts(),
          }}
        ></AsyncTable>
      </a-card>
    );
  }
}
