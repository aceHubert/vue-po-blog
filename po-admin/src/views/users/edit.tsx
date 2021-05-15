import { Vue, Component } from 'nuxt-property-decorator';
import { camelCase } from 'lodash-es';
import { userStore } from '@/store/modules';
import { gql, formatError } from '@/includes/functions';
import { UserCapability } from '@/includes/datas';
import { UserEditForm } from './modules';

// Types
import { User, UserMetas, UserResponse } from 'types/datas/user';
{
  /* <router>
{
  name:'users-edit',
  path:':id(\\d+)/edit',
  alias:[{
    name: 'profile-edit',
    path:'/profile/edit',
  }],
  meta:{
    title: 'Edit',
  }
}
</router> */
}

@Component({
  name: 'UserEdit',
  meta: {
    capabilities: [UserCapability.EditUsers],
  },
  head() {
    return {
      title: this.$tv('pageTitle.user.edit', 'Edit User') as string,
    };
  },
  asyncData: async ({ error, redirect, route, graphqlClient }) => {
    if (route.params.id === userStore.id) {
      return redirect('/profile/edit');
    }
    return graphqlClient
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
              createTime: createdAt
              metas {
                key: metaKey
                value: metaValue
              }
            }
          }
        `,
        variables: {
          id: route.params.id || userStore.id!,
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
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode: statusCode, message });
      });
  },
})
export default class UserEdit extends Vue {
  editModel!: User & Partial<UserMetas>;

  data() {
    return {
      editModel: null,
    };
  }

  get isYourself() {
    return !this.$route.params.id;
  }

  render() {
    return (
      <a-card class="user-edit" bordered={false}>
        <UserEditForm
          editModel={this.editModel}
          btnTitle={
            this.isYourself
              ? (this.$tv('user.btnTips.updateProfile', 'Update Profile') as string)
              : (this.$tv('user.btnTips.updateUser', 'Update User') as string)
          }
          btnText={
            this.isYourself
              ? (this.$tv('user.btnText.updateProfile', 'Update Profile') as string)
              : (this.$tv('user.btnText.updateUser', 'Update User') as string)
          }
        />
      </a-card>
    );
  }
}
