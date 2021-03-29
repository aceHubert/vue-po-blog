import { Vue, Component } from 'nuxt-property-decorator';
import { camelCase } from 'lodash-es';
import { gql, formatError } from '@/includes/functions';
import EditForm from './modules/EditForm';

// Types
import { User, UserMetas, UserResponse } from 'types/datas/user';
{
  /* <router>
{
  name:'users-edit',
  meta:{
    title: 'Edit',
  }
}
</router> */
}

@Component({
  name: 'UserEdit',
  head() {
    return {
      title: this.$tv('pageTitle.user.edit', 'Edit User') as string,
    };
  },
  asyncData: async ({ error, route, $i18n, graphqlClient }) => {
    try {
      // 获取用户
      return graphqlClient
        .query<{ user: UserResponse }, { id: number }>({
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
            id: parseFloat(route.params.id),
          },
        })
        .then(({ data }) => {
          const { metas, ...rest } = data.user;
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
        });
    } catch (err) {
      const { statusCode, message } = formatError(err);
      return error({
        statusCode: statusCode || 500,
        message: $i18n.tv(`error.${statusCode}`, message) as string,
      });
    }
  },
})
export default class UserEdit extends Vue {
  editModel!: User & Partial<UserMetas>;

  data() {
    return {
      editModel: null,
    };
  }

  render() {
    return (
      <div>
        <EditForm editModel={this.editModel} />
      </div>
    );
  }
}
