import { Vue, Component } from 'nuxt-property-decorator';
import { camelCase } from 'lodash-es';
import { gql, formatError } from '@/includes/functions';
import EditForm from './modules/EditForm';

// Types
import { User, UserMetas, UserResponse } from 'types/datas/user';

{
  /* <router>
{
  path:'/profile',
  meta:{
    title: 'Profile',
  }
}
</router> */
}

@Component({
  name: 'Profile',
  head() {
    return {
      title: this.$tv('pageTitle.user.profile', 'Profile') as string,
    };
  },
  asyncData: async ({ route, error, graphqlClient }) => {
    let promisify;
    if (route.query.id) {
      promisify = graphqlClient
        .query<{ user: UserResponse }, { id: string }>({
          query: gql`
            query getUser($id: ID!) {
              user: userById(id: $id) {
                id
                username: loginName
                email
                mobile
                displayName
                url
                status
                isSuperAdmin
                metas {
                  key: metaKey
                  value: metaValue
                }
              }
            }
          `,
          variables: {
            id: route.query.id as string,
          },
        })
        .then(({ data }) => data.user);
    } else {
      promisify = graphqlClient
        .query<{ user: UserResponse }>({
          query: gql`
            query getUser {
              user {
                id
                username: loginName
                email
                mobile
                displayName
                url
                status
                isSuperAdmin
                metas {
                  key: metaKey
                  value: metaValue
                }
              }
            }
          `,
        })
        .then(({ data }) => data.user);
    }
    return promisify
      .then((user) => {
        const { metas, ...rest } = user;
        return {
          editModel: Object.assign(
            {},
            rest,
            metas.reduce((prev, curr) => {
              prev[camelCase(curr.key)] = curr.value;
              return prev;
            }, {} as Dictionary<string>),
          ),
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        return error({ statusCode, message });
      });
  },
})
export default class Profile extends Vue {
  editModel!: User & Partial<UserMetas>;

  data() {
    return {
      editModel: null,
    };
  }

  render() {
    return (
      <div style="max-width:900px;">
        <EditForm
          editModel={this.editModel}
          btnTitle={this.$tv('user.btnTips.updateProfile', 'Update Profile') as string}
          btnText={this.$tv('user.btnText.updateProfile', 'Update Profile') as string}
        />
      </div>
    );
  }
}
