import { Vue, Component } from 'nuxt-property-decorator';
import { AsyncFileList } from '@/components';
// import { gql, formatError } from '@/includes/functions';

// Types
import { MediaPagedQuery } from 'types/datas/media';
import { DataSourceFn, File } from '@/components/async-file-list/AsyncFileList';

{
  /* <router>
{
  meta:{
    title: 'All Medias',
  }
}
</router>  */
}

@Component({
  name: 'MediaIndex',
})
export default class MediaIndex extends Vue {
  // 从 URI 获取搜索条件，并判断值的正确性
  get searchQuery() {
    const query: Omit<MediaPagedQuery, 'offset' | 'limit'> = {
      keyword: this.$route.query['keyword'] as string,
    };

    return query;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadData({ page, size }: Parameters<DataSourceFn>[0]): Promise<File[]> {
    return Promise.resolve([]);
    // const query: MediaPagedQuery = {
    //   ...this.searchQuery,
    //   offset: (page - 1) * size,
    //   limit: size,
    // };
    // return this.graphqlClient
    //   .query<{ medias: MediaPagedResponse }, MediaPagedQuery>({
    //     query: gql`
    //       query getMedias($keyword: String, $limit: Int, $offset: Int) {
    //         posts(keyword: $keyword, limit: $limit, offset: $offset) {
    //           rows {
    //             id
    //             fileName
    //             originalFileName
    //             extension
    //             mimeType
    //             createTime: createdAt
    //           }
    //           total
    //         }
    //       }
    //     `,
    //     variables: query,
    //   })
    //   .then(({ data }) => {
    //     return data.medias;
    //   })
    //   .catch((err) => {
    //     const { message } = formatError(err);
    //     throw new Error(message);
    //   });
  }

  render() {
    return (
      <div>
        <AsyncFileList dataSource={this.loadData.bind(this)} />
      </div>
    );
  }
}
