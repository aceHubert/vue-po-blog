import { Vue, Component, Ref } from 'nuxt-property-decorator';
import { gql, formatError } from '@/includes/functions';
import { PostStatus, UserCapability } from '@/includes/datas/enums';
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
  meta: {
    capabilities: [UserCapability.CreatePosts],
  },
  asyncData({ route, error, graphqlClient }) {
    return graphqlClient
      .query<{ post: Post }, { id: string }>({
        query: gql`
          query getPost($id: ID!) {
            post(id: $id) {
              id
              title
              content
              excerpt
              status
              parent
              commentStatus
            }
          }
        `,
        variables: {
          id: route.params.id,
        },
      })
      .then(({ data }) => ({
        post: data.post,
      }))
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode, message });
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
