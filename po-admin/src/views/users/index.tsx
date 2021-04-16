import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { camelCase, lowerFirst } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, SearchForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { UserRole, UserCapability } from '@/includes/datas';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { UserWithRole, UserMetas, UserPagedQuery, UserPagedResponse } from 'types/datas';
import { DataSourceFn } from '@/components/AsyncTable/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/SearchFrom/SearchForm';

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
      title: this.$tv('pageTitle.user.index', 'Users') as string,
    };
  },
  asyncData: async ({ error, graphqlClient }) => {
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
  itemCount!: number;
  blukApplying!: boolean;

  data() {
    return {
      // columns: [],
      selectedRowKeys: [],
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
  get roleOptions(): StatusOption[] {
    return [
      {
        value: undefined,
        label: this.$tv('user.role.all', 'All') as string,
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
  get blukActionOptions(): BlukAcitonOption[] {
    return [
      {
        value: BlukActions.Delete,
        label: this.$tv('user.search.bulkDeleteAction', 'Delete') as string,
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
        this.$message.error(this.$tv(`error.${statusCode}`, message) as string);
      });
  }

  // keyword 的搜索按纽
  handleSearch() {
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: string | number) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({ content: this.$tv('user.bulkRowReqrired', 'Please choose a row!') as string });
      return;
    }

    if (action === BlukActions.Delete) {
      this.$confirm({
        content: this.$tv('user.btnTips.blukDeletePopContent', 'Do you really want to delete these users?'),
        okText: this.$tv('user.btnText.deletePopOkText', 'Ok') as string,
        cancelText: this.$tv('user.btnText.deletePopCancelText', 'No') as string,
        onOk: () => {
          this.blukApplying = true;
          this.graphqlClient
            .mutate<{ result: boolean }, { ids: string[] }>({
              mutation: gql`
                mutation blukRemove($ids: [ID!]!) {
                  result: blukRemoveUsers(ids: $ids)
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
                    'user.tips.blukDeleteFailed',
                    'An error occurred while deleting users, please try later again!',
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
          mutation remove($id: ID!) {
            result: removeUser(id: $id)
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
              'user.tips.deleteFailed',
              'An error occurred while deleting user, please try later again!',
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

        {record.id !== userStore.id
          ? [
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('user.btnTips.deletePopContent', 'Do you really want to delete this user?')}
                okText={this.$tv('user.btnText.deletePopOkText', 'Ok')}
                cancelText={this.$tv('user.btnText.deletePopCancelText', 'No')}
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
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('name', 'Name')}: </span>
                  {record.firstName || record.lastName
                    ? `${record.firstName} ${record.lastName}`
                    : record.nickName || record.displayName}
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('mobile', 'Mobile')}: </span>
                  {record.mobile || '-'}
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('email', 'Email')}: </span>
                  <a href={`mailto:${record.email}`}>{record.email}</a>
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('userRole', 'Role')}: </span>
                  {this.$tv(`user.role.${lowerFirst(record.userRole || 'none')}`, record.userRole || 'none')}
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('createTime', 'CreateTime')}: </span>
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
