import { Vue, Component, Watch, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, SearchForm, TermEditForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { TermTaxonomy, UserCapability } from '@/includes/datas/enums';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { Term, TermQuery, TermCreationModel, TermUpdateModel } from 'types/datas';
import { BlukAcitonOption } from '@/components/SearchFrom/SearchForm';
import { TreeData } from '@/components/TermEditForm/TermEditForm';

enum BlukActions {
  Delete = 'delete',
}
{
  /* <router>
{
  meta:{
    title: 'Categories'
  }
}
</router> */
}

@Component({
  name: 'Categories',
  meta: {
    capabilities: [UserCapability.EditPosts],
  },
})
export default class Categories extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  selectedRowKeys!: string[];
  itemCount!: number;
  searchQuery!: TermQuery;
  blukApplying!: boolean;
  formModelShown!: boolean;
  editModel?: Term;

  data() {
    return {
      selectedRowKeys: [],
      itemCount: 0,
      searchQuery: {},
      blukApplying: false,
      formModelShown: false,
      editModel: undefined,
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

  // 批量操作
  get blukActionOptions(): BlukAcitonOption<BlukActions>[] {
    return [
      {
        value: BlukActions.Delete,
        label: this.$tv('category.search.bulkDeleteAction', 'Delete') as string,
      },
    ];
  }

  @Watch('formModelShown')
  watchFormModelShown(val: boolean) {
    // v-model 只是显示/隐藏, EditForm数据修改后没会刷新
    // 每次显示时强制刷新一次
    if (val) {
      this.$forceUpdate();
    }
  }

  // 加载 table 数据
  loadData() {
    return this.graphqlClient
      .query<{ terms: Term[] }, TermQuery>({
        query: gql`
          query getTerms($keyword: String) {
            terms(taxonomy: "category", keyword: $keyword) {
              id
              name
              slug
              taxonomyId
              parentId
              description
              count
            }
          }
        `,
        variables: {
          ...this.searchQuery,
        },
      })
      .then(({ data }) => {
        this.itemCount = data.terms.length;
        const rows: Array<Term & { displayName?: string }> = [];
        // 当有搜索条件时，嵌套会出现断层。直接显示即可
        if (this.searchQuery.keyword) {
          // 根目录倒序
          rows.push(...data.terms.sort((a, b) => (a.id > b.id ? -1 : 1)));
        } else {
          // 重命名并进行按嵌套级排序
          (function formatRows(terms: Term[], pid = '0', deep = 0) {
            let treeData = terms.filter(({ parentId }) => parentId === pid);
            // 根目录倒序
            if (pid === '0') {
              treeData = treeData.sort((a, b) => (a.id > b.id ? -1 : 1));
            }
            const space = Array.from({ length: deep })
              .map(() => '—')
              .join(' ');
            treeData.forEach((item) => {
              rows.push({ ...item, displayName: `${space.length ? space + ' ' : ''}${item.name}` });
              formatRows(terms, item.taxonomyId, deep + 1);
            });
          })(data.terms);
        }

        return {
          rows,
          total: data.terms.length,
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

  // 获取父节点选项树数据（同步）
  getTreeData() {
    const noneCategory: TreeData = {
      id: '0',
      value: '0',
      title: this.$tv('category.form.noneCategory', 'None') as string,
      isLeaf: true,
    };

    return this.graphqlClient
      .query<{ terms: Term[] }>({
        query: gql`
          query getTerms {
            terms(taxonomy: "category") {
              taxonomyId
              name
              parentId
            }
          }
        `,
      })
      .then(({ data }) => {
        const treeData: TreeData[] = data.terms.map(({ taxonomyId, name, parentId }) => ({
          id: taxonomyId,
          pId: parentId === '0' ? undefined : parentId,
          value: taxonomyId,
          title: name,
        }));
        // 根目录插入 None Category 选项
        treeData.unshift(noneCategory);
        return treeData;
      })
      .catch(() => {
        return [noneCategory] as TreeData[];
      });
  }

  // 新建分类
  onCreate(values: TermCreationModel) {
    return this.graphqlClient
      .mutate<{ term: Term }, { model: TermCreationModel & { taxonomy: 'category' } }>({
        mutation: gql`
          mutation addTerm($model: NewTermInput!) {
            term: addTerm(model: $model) {
              id
            }
          }
        `,
        variables: {
          model: {
            ...values,
            taxonomy: TermTaxonomy.Category,
          },
        },
      })
      .then(() => {
        this.formModelShown = false;
        this.refreshTable();
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 修改分类
  onUpdate(id: string, values: TermUpdateModel) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; model: TermUpdateModel }>({
        mutation: gql`
          mutation modifyTerm($id: ID!, $model: UpdateTermInput!) {
            result: modifyTerm(id: $id, model: $model)
          }
        `,
        variables: {
          id,
          model: values,
        },
      })
      .then(() => {
        this.formModelShown = false;
        this.refreshTable();
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // keyword 的搜索按纽
  handleSearch(query: { keyword?: string }) {
    Object.assign(this.searchQuery, query);
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: BlukActions) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({ content: this.$tv('category.tips.bulkRowReqrired', 'Please choose a row!') as string });
      return;
    }
    if (action === BlukActions.Delete) {
      this.$confirm({
        content: this.$tv('category.btnTips.blukDeletePopContent', 'Do you really want to delete these categorys?'),
        okText: this.$tv('category.btnText.deletePopOkBtn', 'Ok') as string,
        cancelText: this.$tv('category.btnText.deletePopCancelBtn', 'No') as string,
        onOk: () => {
          this.blukApplying = true;
          this.graphqlClient
            .mutate<{ result: boolean }, { ids: string[] }>({
              mutation: gql`
                mutation blukRemove($ids: [ID!]!) {
                  result: blukRemoveTerms(ids: $ids)
                }
              `,
              variables: {
                ids: this.selectedRowKeys,
              },
            })
            .then(({ data }) => {
              if (data?.result) {
                this.selectedRowKeys = [];
                this.refreshTable();
              } else {
                this.$message.error(
                  this.$tv(
                    'category.tips.blukDeleteFailed',
                    'An error occurred during deleting categorys, please try later again!',
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

  // 删除标签
  handleDelete(id: string) {
    this.$nuxt.$loading.start();
    this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation remove($id: ID!) {
            result: removeTerm(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshTable();
        } else {
          this.$message.error(
            this.$tv(
              'category.tips.deleteFailed',
              'An error occurred during deleting category, please try later again!',
            ) as string,
          );
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      })
      .finally(() => {
        this.$nuxt.$loading.finish();
      });
  }

  // 行Checkbox状态
  getCheckboxProps(record: Term) {
    return {
      props: {
        disabled: record.id === this.$userOptions['default_category'],
      },
    };
  }

  // 行选择
  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  render() {
    const getTitle = (dataIndex: string) => {
      return (this.columns as Array<{ title: string; dataIndex: string }>).find(
        (column) => column.dataIndex === dataIndex,
      )?.title;
    };

    const renderActions = (record: Term) => (
      <div class={classes.actions}>
        <a
          href="#none"
          title={this.$tv('category.btnTips.edit', 'Edit') as string}
          onClick={m.stop.prevent(() => {
            this.editModel = record;
            this.formModelShown = true;
          })}
        >
          {this.$tv('category.btnText.edit', 'Edit')}
        </a>
        {record.id !== this.$userOptions['default_category']
          ? [
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('category.btnTips.deletePopContent', 'Do you really want to delete this category?')}
                okText={this.$tv('category.btnText.deletePopOkBtn', 'Ok')}
                cancelText={this.$tv('category.btnText.deletePopCancelBtn', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a
                  href="#none"
                  title={this.$tv('category.btnTips.delete', 'Delete this category permanently') as string}
                >
                  {this.$tv('category.btnText.delete', 'Delete')}
                </a>
              </a-popconfirm>,
            ]
          : null}
      </div>
    );

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        name: (text: Term['name'], record: Term & { displayName?: string; expand?: boolean }) => (
          <div class={[classes.columnName]}>
            <p class={[classes.name]}>
              <span class="text-ellipsis" style="max-width:180px;display:inline-block;">
                {record.displayName || record.name}
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
                  <span class="grey--text text--lighten1">{getTitle('slug') || 'Slug'}: </span>
                  {record.slug}
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('description') || 'Description'}: </span>
                  {record.description || '-'}
                </p>
                <p class={classes.contentItem}>
                  <span class="grey--text text--lighten1">{getTitle('count') || 'Count'}: </span>
                  {record.count}
                </p>
              </div>
            ) : null}
            {renderActions(record)}
          </div>
        ),
        description: (text: Term['description']) => text || '-',
      } as any;
    };

    return (
      <a-card class="post-index" bordered={false} size="small">
        <SearchForm
          keywordPlaceholder={this.$tv('category.search.keywordPlaceholder', 'Search Categories') as string}
          itemCount={this.itemCount}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onPreFilters={(query) => {
            Object.assign(this.searchQuery, query);
          }}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="sub">
            <a-button
              type="primary"
              title={this.$tv('category.btnTips.create', 'New Category')}
              onClick={m.stop(() => {
                this.editModel = undefined;
                this.formModelShown = true;
              })}
            >
              {this.$tv('category.btnText.create', 'New Category')}
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
          showPagination={false}
          rowSelection={{
            selectedRowKeys: this.selectedRowKeys,
            getCheckboxProps: this.getCheckboxProps.bind(this),
            onChange: this.handleSelectChange.bind(this),
          }}
          rowClassName={() => classes.tableRow}
          {...{
            scopedSlots: scopedSolts(),
          }}
        ></AsyncTable>

        <a-modal
          vModel={this.formModelShown}
          title={this.$tv(
            `category.form.${this.editModel ? 'updateModelTitle' : 'creationModelTitle'}`,
            this.editModel ? 'Update Category' : 'Create Category',
          )}
          keyboard={false}
          maskClosable={false}
          destroyOnClose={true}
          footer={null}
        >
          <TermEditForm
            editModel={this.editModel}
            taxonomy={TermTaxonomy.Category}
            nested
            syncTreeData
            getTreeData={this.getTreeData.bind(this)}
            createTerm={this.onCreate.bind(this)}
            updateTerm={this.onUpdate.bind(this)}
          />
        </a-modal>
      </a-card>
    );
  }
}
