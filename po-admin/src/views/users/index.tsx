import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { camelCase, snakeCase } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, InlineTableRow, SearchForm } from '@/components';
import { hook, gql, formatError } from '@/includes/functions';
import { UserRole, UserCapability } from '@/includes/datas';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { Column, CustomColumns, UserWithRole, UserMetas, UserPagedQuery, UserPagedResponse } from 'types/datas';
import { DataSourceFn } from '@/components/async-table/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/search-form/SearchForm';

// import { Table } from 'types/constants';

enum BlukActions {
  Delete = 'delete',
}

{
  /* <router>
{
  prop:true,
  meta:{
    title: 'All Users',
  }
}
</router> */
}

const UserRoleOrder = Object.keys(UserRole)
  .concat('None')
  .reduce((prev, value, index) => {
    prev[value] = index;
    return prev;
  }, {} as Dictionary<number>);

@Component<UserIndex>({
  name: 'UserIndex',
  meta: {
    capabilities: [UserCapability.ListUsers],
  },
  head() {
    return {
      title: this.$tv('core.page-user.page_title.index', 'Users') as string,
    };
  },
  asyncData: async ({ error, graphqlClient }) => {
    try {
      const customColumns = await hook('user:columns').filter(null);
      // 获取分类
      const { data } = await graphqlClient.query<{
        roleCounts: Array<{ role: UserRole | 'None'; count: number }>;
      }>({
        query: gql`
          query getFilters {
            roleCounts: userCountByRole {
              userRole
              count
            }
          }
        `,
      });
      return {
        roleCounts: data.roleCounts,
        customColumns,
      };
    } catch (err) {
      const { statusCode, message } = formatError(err);
      return error({ statusCode, message });
    }
  },
})
export default class UserIndex extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @InjectReactive({ from: 'isTablet' }) isTablet!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  // columns!: ReturnType<Table>['columns'];
  selectedRowKeys!: string[];
  roleCounts!: Array<{ userRole: UserRole | 'None'; count: number }>;
  customColumns!: CustomColumns;
  itemCount!: number;
  blukApplying!: boolean;

  data() {
    return {
      customColumns: [],
      selectedRowKeys: [],
      roleCounts: [],
      itemCount: 0,
      blukApplying: false,
    };
  }

  // 所有列配置。 动态计算，title 配置有多语言
  get columns() {
    const i18nRender = (key: string, fallback: string) => this.$tv(key, fallback) as string;
    let customColumns = this.customColumns;
    if (typeof this.customColumns === 'function') {
      customColumns = this.customColumns.call(this, i18nRender);
    }
    return [...table.call(this, { i18nRender }).columns, ...(customColumns as Column[])];
  }

  // 在不同尺寸屏幕显示的列
  get fixedColumns() {
    if (this.isMobile) {
      return this.columns.filter((column) => column.showInMobile);
    } else if (this.isTablet) {
      return this.columns.filter((column) => column.showInTablet);
    }
    return this.columns;
  }

  // 未在table 中显示的列
  get inlineColumns() {
    return this.columns.filter((column) => !this.fixedColumns.includes(column));
  }

  // 添加 All 选项
  get roleOptions(): StatusOption[] {
    return [
      {
        value: undefined,
        label: this.$tv('core.page-user.role.all', 'All') as string,
        // 总数不记录 None 状态
        count: this.roleCounts.reduce((prev, curr) => {
          return prev + curr.count;
        }, 0),
        keepStatusShown: true,
      },
      ...this.roleCounts
        .map(({ userRole, count }) => ({
          value: userRole,
          label: this.$tv(
            `core.page-user.role.${userRole === 'None' ? 'none_full_name' : snakeCase(userRole)}`,
            userRole,
          ) as string,
          count,
          order: UserRoleOrder[userRole],
        }))
        .sort((curr, next) => (curr.order > next.order ? 1 : -1)),
    ];
  }

  // 批量操作
  get blukActionOptions(): BlukAcitonOption[] {
    return [
      {
        value: BlukActions.Delete,
        label: this.$tv('core.page-user.search.bulk_delete_action_text', 'Delete') as string,
      },
    ];
  }

  // 加载 table 数据
  loadData({ page, size }: Parameters<DataSourceFn>[0]) {
    const query: UserPagedQuery = {
      keyword: this.$route.query['keyword'] as string,
      userRole: this.$route.query['role'] as UserRole,
      offset: (page - 1) * size,
      limit: size,
    };
    return this.graphqlClient
      .query<{ users: UserPagedResponse }, UserPagedQuery>({
        query: gql`
          query getUsers($keyword: String, $userRole: USER_ROLE_WITH_NONE, $limit: Int, $offset: Int) {
            users(keyword: $keyword, userRole: $userRole, limit: $limit, offset: $offset) {
              rows {
                id
                username: loginName
                displayName
                mobile
                email
                status
                userRole
                createTime: createdAt
                metas(metaKeys: ["nick_name", "first_name", "last_name"]) {
                  key: metaKey
                  value: metaValue
                }
              }
              total
            }
          }
        `,
        variables: query,
      })
      .then(({ data }) => {
        this.itemCount = data.users.total;
        return {
          total: data.users.total,
          rows: data.users.rows.map((user) => {
            const { metas, ...rest } = user;
            return Object.assign(
              {},
              rest,
              metas.reduce((prev, curr) => {
                prev[camelCase(curr.key)] = curr.value;
                return prev;
              }, {} as Dictionary<string>),
            );
          }),
        };
      })
      .catch((err) => {
        const { message } = formatError(err);
        throw new Error(message);
      });
  }

  // 刷新 table, 会调用loadDate
  refreshTable() {
    this.table.refresh();
  }

  // 刷新角色数量
  refreshRoleCounts() {
    return this.graphqlClient
      .query<{ roleCounts: Array<{ userRole: UserRole; count: number }> }>({
        query: gql`
          query getRoleCounts {
            roleCounts: userCountByRole {
              userRole
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        this.roleCounts = data.roleCounts;
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        this.$message.error(this.$tv(`core.error.${statusCode}`, message) as string);
      });
  }

  // keyword 的搜索按纽
  handleSearch() {
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: string | number) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({ content: this.$tv('core.page-user.bulk_row_reqrired', 'Please choose a row!') as string });
      return;
    }

    if (action === BlukActions.Delete) {
      this.$confirm({
        content: this.$tv(
          'core.page-user.btn_tips.bluk_delete_pop_content',
          'Do you really want to delete these users?',
        ),
        okText: this.$tv('core.page-user.btn_text.delete_pop_ok_text', 'Ok') as string,
        cancelText: this.$tv('core.page-user.btn_text.delete_pop_cancel_text', 'No') as string,
        onOk: () => {
          this.blukApplying = true;
          this.graphqlClient
            .mutate<{ result: boolean }, { ids: string[] }>({
              mutation: gql`
                mutation bulkDelete($ids: [ID!]!) {
                  result: bulkDeleteUsers(ids: $ids)
                }
              `,
              variables: {
                ids: this.selectedRowKeys,
              },
            })
            .then(({ data }) => {
              if (data?.result) {
                this.refreshRoleCounts();
                this.refreshTable();
              } else {
                this.$message.error(
                  this.$tv(
                    'core.page-user.tips.bluk_delete_failed',
                    'An error occurred while deleting users, please try again later!',
                  ) as string,
                );
              }
            })
            .catch((err) => {
              const { message } = formatError(err);
              this.$message.error(message);
            })
            .finally(() => {
              this.blukApplying = false;
            });
        },
      });
    }
  }

  // 删除
  handleDelete(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation delete($id: ID!) {
            result: deleteUser(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshRoleCounts();
          this.refreshTable();
        } else {
          this.$message.error(
            this.$tv(
              'core.page-user.tips.delete_failed',
              'An error occurred while deleting user, please try again later!',
            ) as string,
          );
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  render() {
    const $filters = this.$options.filters!;

    const renderActions = (record: UserWithRole) => (
      <div class={classes.actions}>
        <nuxt-link
          to={
            userStore.id === record.id
              ? { name: 'profile-edit' }
              : { name: 'users-edit', params: { id: String(record.id) } }
          }
          title={this.$tv('core.page-user.btn_tips.edit', 'Edit') as string}
        >
          {this.$tv('core.page-user.btn_text.edit', 'Edit')}
        </nuxt-link>

        {record.id !== userStore.id
          ? [
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('core.page-user.tips.delete_pop_content', 'Do you really want to delete this user?')}
                okText={this.$tv('core.page-user.btn_text.delete_pop_ok_text', 'Ok')}
                cancelText={this.$tv('core.page-user.btn_text.delete_pop_cancel_text', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a
                  href="#none"
                  title={this.$tv('core.page-user.btn_tips.delete', 'Delete this user permanently') as string}
                >
                  {this.$tv('core.page-user.btn_text.delete', 'Delete')}
                </a>
              </a-popconfirm>,
            ]
          : null}
      </div>
    );

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        username: (
          text: UserWithRole['username'],
          record: UserWithRole & Partial<UserMetas> & { expand?: boolean },
          index: number,
        ) => (
          <div class={[classes.columnUsername]}>
            <p class={[classes.username]}>
              <span class="text-ellipsis" style="max-width:180px;display:inline-block;">
                {text}
              </span>
              {this.inlineColumns.length ? (
                <a-icon
                  type={record.expand ? 'up-circle' : 'down-circle'}
                  class="grey--text"
                  onClick={() => {
                    this.$set(record, 'expand', !record.expand);
                  }}
                ></a-icon>
              ) : null}
            </p>

            {this.inlineColumns.length ? (
              <div class={[classes.content]} v-show={record.expand}>
                <InlineTableRow
                  columns={this.inlineColumns}
                  record={record}
                  index={index}
                  {...{
                    scopedSlots: scopedSolts(),
                  }}
                />
              </div>
            ) : null}
            {renderActions(record)}
          </div>
        ),
        name: (text: string, record: UserWithRole & Partial<UserMetas>) =>
          record.firstName || record.lastName
            ? `${record.firstName} ${record.lastName}`
            : record.nickName || record.displayName,
        mobile: (text: UserWithRole['mobile']) => text || '-',
        email: (text: UserWithRole['email']) => <a href={`mailto:${text}`}>{text}</a>,
        userRole: (text: UserWithRole['userRole']) =>
          this.$tv(`core.page-user.role.${snakeCase(text || 'none')}`, text || 'none'),
        createTime: (text: string) => $filters.dateFormat(text),
      } as any;
    };

    return (
      <a-card class="user-index" bordered={false} size="small">
        <SearchForm
          keywordPlaceholder={this.$tv('core.page-user.search.keyword_placeholder', 'Search Users') as string}
          statusName="role"
          itemCount={this.itemCount}
          statusOptions={this.roleOptions}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        ></SearchForm>
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
