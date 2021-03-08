import { Vue, Component, Ref } from 'nuxt-property-decorator';
import { graphqlClient, gql } from '@/includes/functions';
import { PostStatus } from '@/includes/datas/enums';
import EditForm from './modules/EditForm';

// Types
import { Post } from 'types/datas/post';

{
  /* <router>
{
  name:'posts-edit',
  meta:{
    title: 'Edit',
  }
}
</router> */
}

@Component({
  name: 'PostEdit',
  layout: 'blank',
  asyncData({ route, error, $i18n }) {
    const id = parseInt(route.params.id);
    return graphqlClient
      .query<{ post: Post }, { id: number }>({
        query: gql`
          query getPost($id: ID!) {
            post(id: $id) {
              id
              title
              content
              excerpt
              status
              commentStatus
            }
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => ({
        post: data.post,
      }))
      .catch((err) => {
        error({
          statusCode: 500,
          message: $i18n.tv(err.code, err.message) as string,
        });
      });
  },
})
export default class PostEdit extends Vue {
  @Ref('form') editForm!: EditForm;

  post!: Post;

  data() {
    return {
      post: {},
    };
  }

  handelChange(_values: Dictionary<any>) {
    // todo
  }

  render() {
    return this.post.status === PostStatus.Trash ? (
      <a-card>Trash</a-card>
    ) : (
      <EditForm editModel={this.post} style="height:100vh" onChange={this.handelChange.bind(this)}></EditForm>
    );
  }
}
