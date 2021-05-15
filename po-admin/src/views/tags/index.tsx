import { Vue, Component, Watch, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { AsyncTable, SearchForm, TermEditForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { TermTaxonomy, UserCapability } from '@/includes/datas';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { Term, TermQuery, TermCreationModel, TermUpdateModel } from 'types/datas';
import { BlukAcitonOption } from '@/components/search-from/SearchForm';

enum BlukActions {
  Delete = 'delete',
}

{
  /* <router>
{
  meta:{
    title: 'Tags'
  }
}
</router> */
}

@Component({
  name: 'Tags',
  meta: {
    capabilities: [UserCapability.ManageTags],
  },
})
export default class Tags extends Vue {
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
        label: this.$tv('tag.search.bulkDeleteAction', 'Delete') as string,
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
    const query: TermQuery = {
      keyword: this.$route.query['keyword'] as string,
    };
    return this.graphqlClient
      .query<{ terms: Term[] }, TermQuery>({
        query: gql`
          query getTerms($keyword: String) {
            terms(taxonomy: "tag", keyword: $keyword) {
              id
              name
              slug
              description
              count
            }
          }
        `,
        variables: query,
      })
      .then(({ data }) => {
        this.itemCount = data.terms.length;
        return {
          rows: data.terms,
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

  // 新建标签
  onCreate(values: TermCreationModel) {
    return this.graphqlClient
      .mutate<{ term: Term }, { model: TermCreationModel & { taxonomy: 'tag' } }>({
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
            taxonomy: TermTaxonomy.Tag,
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

  // 修改标签
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
      this.$message.warn({ content: this.$tv('tag.tips.bulkRowReqrired', 'Please choose a row!') as string });
      return;
    }
    if (action === BlukActions.Delete) {
      this.$confirm({
        content: this.$tv('tag.btnTips.blukDeletePopContent', 'Do you really want to delete these tags?'),
        okText: this.$tv('tag.btnText.deletePopOkText', 'Ok') as string,
        cancelText: this.$tv('tag.btnText.deletePopCancelText', 'No') as string,
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
                    'tag.tips.blukDeleteFailed',
                    'An error occurred while deleting tags, please try later again!',
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
              'tag.tips.deleteFailed',
              'An error occurred while deleting tag, please try later again!',
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

    const renderActions = (record: Term) => (
      <div class={classes.actions}>
        <a
          href="#none"
          title={this.$tv('tag.btnTips.edit', 'Edit') as string}
          onClick={m.stop.prevent(() => {
            this.editModel = record;
            this.formModelShown = true;
          })}
        >
          {this.$tv('tag.btnText.edit', 'Edit')}
        </a>
        <a-divider type="vertical" />
        <a-popconfirm
          title={this.$tv('tag.btnTips.deletePopContent', 'Do you really want to delete this tag?')}
          okText={this.$tv('tag.btnText.deletePopOkText', 'Ok')}
          cancelText={this.$tv('tag.btnText.deletePopCancelText', 'No')}
          onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
        >
          <a href="#none" title={this.$tv('tag.btnTips.delete', 'Delete this tag permanently') as string}>
            {this.$tv('tag.btnText.delete', 'Delete')}
          </a>
        </a-popconfirm>
      </div>
    );

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        name: (text: Term['name'], record: Term & { expand?: boolean }) => (
          <div class={[classes.columnName]}>
            <p class={[classes.name]}>
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
          keywordPlaceholder={this.$tv('tag.search.keywordPlaceholder', 'Search Tags') as string}
          itemCount={this.itemCount}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="sub">
            <a-button
              type="primary"
              title={this.$tv('tag.btnTips.create', 'New Tag')}
              onClick={m.stop(() => {
                this.editModel = undefined;
                this.formModelShown = true;
              })}
            >
              {this.$tv('tag.btnText.create', 'New Tag')}
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
            `tag.form.${this.editModel ? 'updateModelTitle' : 'creationModelTitle'}`,
            this.editModel ? 'Update Tag' : 'Create Tag',
          )}
          keyboard={false}
          maskClosable={false}
          destroyOnClose={true}
          footer={null}
        >
          <TermEditForm
            editModel={this.editModel}
            taxonomy={TermTaxonomy.Tag}
            createTerm={this.onCreate.bind(this)}
            updateTerm={this.onUpdate.bind(this)}
          />
        </a-modal>
      </a-card>
    );
  }
}
