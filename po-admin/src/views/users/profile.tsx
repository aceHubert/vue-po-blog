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
  asyncData: async ({ error, $i18n, graphqlClient }) => {
    try {
      // 获取用户
      return graphqlClient
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
export default class Profile extends Vue {
  editModel!: User & Partial<UserMetas>;

  data() {
    return {
      editModel: null,
    };
  }

  render() {
    return (
      <div>
        <EditForm
          editModel={this.editModel}
          btnTitle={this.$tv('user.btnTips.updateProfile', 'Update Profile') as string}
          btnText={this.$tv('user.btnText.updateProfile', 'Update Profile') as string}
        />
      </div>
    );
  }
}
