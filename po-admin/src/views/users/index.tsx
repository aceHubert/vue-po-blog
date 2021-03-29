import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { camelCase, lowerFirst } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, SearchForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { UserRole } from '@/includes/datas/enums';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { PagerQuery, UserWithRole, UserMetas, UserPagerQuery, UserPagerResponse } from 'types/datas';
import { DataSource } from '@/components/AsyncTable/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/SearchFrom/SearchForm';

// import { Table } from 'types/constants';

type QueryParams = Omit<UserPagerQuery, keyof PagerQuery<{}>>;

enum BlukActions {
  Delete = 'delete',
}

{
  /* <router>
{
  prop:true,
  meta:{
    title: 'All Users',
    keepAlive: true,
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
  head() {
    return {
      title: this.$tv('pageTitle.user.index', 'Users') as string,
    };
  },
  asyncData: async ({ error, $i18n, graphqlClient }) => {
    try {
      // const columns = await hook('user:columns').filter(
      //   table({ i18nRender: (key, fallback) => $i18n.tv(key, fallback) }).columns,
      // );
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
      };
    } catch (err) {
      const { statusCode, message } = formatError(err);
      return error({
        statusCode: statusCode || 500,
        message: $i18n.tv(`error.${statusCode}`, message) as string,
      });
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
  itemCount!: number;
  searchQuery!: QueryParams;
  blukApplying!: boolean;

  data() {
    return {
      // columns: [],
      selectedRowKeys: [],
      searchQuery: {},
      roleCounts: [],
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
    } else if (this.isTablet) {
      return this.columns.filter((column) => column.hideInTablet !== true);
    }
    return this.columns;
  }

  // 添加 All 选项
  get roleOptions(): StatusOption<UserRole | 'None' | undefined>[] {
    return [
      {
        value: undefined,
        label: this.$tv('user.role.all', 'All') as string,
        // 总数不记录 None 状态
        count: this.roleCounts.reduce((prev, curr) => {
          return prev + (curr.userRole === 'None' ? 0 : curr.count);
        }, 0),
        keepStatusShown: true,
      },
      ...this.roleCounts
        .map(({ userRole, count }) => ({
          value: userRole,
          label: this.$tv(
            `user.role.${userRole === 'None' ? 'noneFullName' : lowerFirst(userRole)}`,
            userRole,
          ) as string,
          count,
          order: UserRoleOrder[userRole],
        }))
        .sort((curr, next) => (curr.order > next.order ? 1 : -1)),
    ];
  }

  // 批量操作
  get blukActionOptions(): BlukAcitonOption<BlukActions>[] {
    return [
      {
        value: BlukActions.Delete,
        label: this.$tv('user.search.bulkDeleteAction', 'Delete') as string,
      },
    ];
  }

  // 加载 table 数据
  loadData({ page, size }: Parameters<DataSource>[0]) {
    return this.graphqlClient
      .query<{ users: UserPagerResponse }, UserPagerQuery>({
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
                isSuperAdmin
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
        variables: {
          ...this.searchQuery,
          offset: (page - 1) * size,
          limit: size,
        },
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
        const { statusCode, message } = formatError(err);
        throw new Error(this.$tv(`error.${statusCode}`, message) as string);
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
        this.$message.error(this.$tv(`error.${statusCode}`, message) as string);
      });
  }

  // keyword 的搜索按纽
  handleSearch(query: { keyword?: string; role?: UserRole | 'None' }) {
    Object.assign(this.searchQuery, query);
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: BlukActions) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({ content: this.$tv('user.bulkRowReqrired', 'Please choose a row!') as string });
      return;
    }

    if (action === BlukActions.Delete) {
      // todo
    }
  }

  // 删除
  handleDelete(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deleteUser($id: ID!) {
            result: removeUser(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(() => {
        this.refreshRoleCounts();
        this.refreshTable();
      })
      .catch(() => {
        this.$message.error(this.$tv('post.delete.errorTips', 'Delete failed!') as string);
      });
  }

  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  render() {
    const $filters = this.$options.filters!;

    const getTitle = (dataIndex: string, defaultTitle: string) => {
      return (
        (this.columns as Array<{ title: string; dataIndex: string }>).find((column) => column.dataIndex === dataIndex)
          ?.title || defaultTitle
      );
    };

    const renderActions = (record: UserWithRole) => (
      <div class={classes.actions}>
        <nuxt-link
          to={
            userStore.id === record.id
              ? { name: 'users-profile' }
              : { name: 'users-edit', params: { id: String(record.id) } }
          }
          title={this.$tv('user.btnTips.edit', 'Edit') as string}
        >
          {this.$tv('user.btnText.edit', 'Edit')}
        </nuxt-link>

        {!record.isSuperAdmin
          ? [
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('user.btnTips.deletePopContent', 'Do you really want to delete this user?')}
                okText={this.$tv('user.btnText.deletePopOkBtn', 'Ok')}
                cancelText={this.$tv('user.btnText.deletePopCancelBtn', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a href="#none" title={this.$tv('user.btnTips.delete', 'Delete this user permanently') as string}>
                  {this.$tv('user.btnText.delete', 'Delete')}
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
        ) => (
          <div class={[classes.columnUsername]}>
            <p class={[classes.username]}>
              <span class="text-ellipsis" style="max-width:180px;display:inline-block;">
                {text}
              </span>
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
                  <span>{getTitle('name', 'Name')}: </span>
                  {record.firstName || record.lastName
                    ? `${record.firstName} ${record.lastName}`
                    : record.nickName || record.displayName}
                </p>
                <p>
                  <span>{getTitle('mobile', 'Mobile')}: </span>
                  {record.mobile || '-'}
                </p>
                <p>
                  <span>{getTitle('email', 'Email')}: </span>
                  <a href={`mailto:${record.email}`}>{record.email}</a>
                </p>
                <p>
                  <span>{getTitle('userRole', 'Role')}: </span>
                  {this.$tv(`user.role.${lowerFirst(record.userRole || 'none')}`, record.userRole || 'none')}
                </p>
                <p>
                  <span>{getTitle('createTime', 'CreateTime')}: </span>
                  {$filters.dateFormat(record.createTime)}
                </p>
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
          this.$tv(`user.role.${lowerFirst(text || 'none')}`, text || 'none'),
        createTime: (text: string) => $filters.dateFormat(text),
      } as any;
    };

    return (
      <a-card class="post-index" bordered={false}>
        <SearchForm
          keywordPlaceholder={this.$tv('user.search.keywordPlaceholder', 'Search Post') as string}
          statusName="userRole"
          itemCount={this.itemCount}
          statusOptions={this.roleOptions}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onPreFilters={(query) => {
            Object.assign(this.searchQuery, query);
          }}
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
