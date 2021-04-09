import { Vue, Component } from 'nuxt-property-decorator';
import { gql, formatError } from '@/includes/functions';
import { UserCapability } from '@/includes/datas/enums';
import EditForm from './modules/EditForm';

// Types
import { Post, PostCreationModel } from 'types/datas/post';

{
  /* <router>
{
  meta:{
    title: 'New',   
  }
}
</router> */
}

@Component({
  name: 'PostCreate',
  layout: 'blank',
  meta: {
    capabilities: [UserCapability.CreatePosts],
  },
  asyncData({ error, graphqlClient }) {
    return graphqlClient
      .mutate<{ post: Post }, { model: PostCreationModel }>({
        mutation: gql`
          mutation addPost($model: NewPostInput!) {
            post: addPost(model: $model) {
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
          model: {
            title: '',
            content: '',
          },
        },
      })
      .then(({ data }) => ({
        post: data!.post,
      }))
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode, message });
      });
  },
})
export default class PostCreate extends Vue {
  post!: Post;

  data() {
    return {
      post: null,
    };
  }

  handelChange(_values: Dictionary<any>) {
    // todo
  }

  render() {
    return (
      <EditForm
        fromCreate
        editModel={this.post}
        style="height:100vh"
        onChange={this.handelChange.bind(this)}
      ></EditForm>
    );
  }
}
