import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, SearchForm, TermEditForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { TermTaxonomy, UserCapability } from '@/includes/datas';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { Term, TermQuery, TermCreationModel, TermUpdateModel } from 'types/datas';
import { BlukAcitonOption } from '@/components/search-form/SearchForm';
import { TreeData } from '@/components/term-edit-form/TermEditForm';

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
    capabilities: [UserCapability.ManageCategories],
  },
})
export default class Categories extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  selectedRowKeys!: string[];
  itemCount!: number;
  blukApplying!: boolean;
  formModelShown!: boolean;
  editModel?: Term;

  data() {
    return {
      selectedRowKeys: [],
      itemCount: 0,
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
  get blukActionOptions(): BlukAcitonOption[] {
    return [
      {
        value: BlukActions.Delete,
        label: this.$tv('core.page-category.search.bulk_delete_action_text', 'Delete') as string,
      },
    ];
  }

  // 加载 table 数据
  loadData() {
    const query: TermQuery = {
      keyword: this.$route.query['keyword'] as string,
    };
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
        variables: query,
      })
      .then(({ data }) => {
        this.itemCount = data.terms.length;
        const rows: Array<Term & { displayName?: string }> = [];
        // 当有搜索条件时，嵌套会出现断层。直接显示即可
        if (query.keyword) {
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
      title: this.$tv('core.page-category.term_form.none_category', 'None') as string,
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
          mutation createTerm($model: NewTermInput!) {
            term: createTerm(model: $model) {
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
          mutation updateTerm($id: ID!, $model: UpdateTermInput!) {
            result: updateTerm(id: $id, model: $model)
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
  handleSearch() {
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: string | number) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({
        content: this.$tv('core.page-category.tips.bulk_row_reqrired', 'Please choose a row!') as string,
      });
      return;
    }
    if (action === BlukActions.Delete) {
      this.$confirm({
        content: this.$tv(
          'core.page-category.btn_tips.bluk_delete_pop_content',
          'Do you really want to delete these categories?',
        ),
        okText: this.$tv('core.page-category.btn_text.delete_pop_ok_text', 'Ok') as string,
        cancelText: this.$tv('core.page-category.btn_text.delete_pop_cancel_text', 'No') as string,
        onOk: () => {
          this.blukApplying = true;
          this.graphqlClient
            .mutate<{ result: boolean }, { ids: string[] }>({
              mutation: gql`
                mutation bulkDelete($ids: [ID!]!) {
                  result: bulkDeleteTerms(ids: $ids)
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
                    'category.tips.bluk_delete_failed',
                    'An error occurred while deleting categories, please try again later!',
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
          mutation delete($id: ID!) {
            result: deleteTerm(id: $id)
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
              'core.page-category.tips.delete_failed',
              'An error occurred while deleting category, please try again later!',
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

    // 行Checkbox状态
    const getCheckboxProps = (record: Term) => {
      return {
        props: {
          disabled: record.id === this.$userOptions['default_category'],
        },
      };
    };

    const renderActions = (record: Term) => (
      <div class={classes.actions}>
        <a
          href="#none"
          title={this.$tv('core.page-category.btn_tips.edit', 'Edit') as string}
          onClick={m.stop.prevent(() => {
            this.editModel = record;
            this.formModelShown = true;
          })}
        >
          {this.$tv('core.page-category.btn_text.edit', 'Edit')}
        </a>
        {record.id !== this.$userOptions['default_category']
          ? [
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv(
                  'core.page-category.btn_tips.delete_pop_content',
                  'Do you really want to delete this category?',
                )}
                okText={this.$tv('core.page-category.btn_text.delete_pop_ok_text', 'Ok')}
                cancelText={this.$tv('core.page-category.btn_text.delete_pop_cancel_text', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a
                  href="#none"
                  title={this.$tv('core.page-category.btn_tips.delete', 'Delete this category permanently') as string}
                >
                  {this.$tv('core.page-category.btn_text.delete', 'Delete')}
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
          keywordPlaceholder={this.$tv('core.page-category.search.keyword_placeholder', 'Search Categories') as string}
          itemCount={this.itemCount}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="sub">
            <a-button
              type="primary"
              title={this.$tv('core.page-category.btn_tips.create', 'New Category')}
              onClick={m.stop(() => {
                this.editModel = undefined;
                this.formModelShown = true;
              })}
            >
              {this.$tv('core.page-category.btn_text.create', 'New Category')}
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
            getCheckboxProps: getCheckboxProps.bind(this),
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
            `core.page-category.term_form.${this.editModel ? 'update_model_title' : 'creation_model_title'}`,
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
            i18nKeyPrefix="core.page-category"
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
