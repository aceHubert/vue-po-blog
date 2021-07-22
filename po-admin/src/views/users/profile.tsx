import { Vue, Component } from 'nuxt-property-decorator';
import { camelCase } from 'lodash-es';
import { userStore } from '@/store/modules';
import { gql, formatError } from '@/includes/functions';
import classes from './styles/profile.less?module';

// Types
import { User, UserMetas, UserResponse } from 'types/datas/user';

{
  /* <router>
{
  path:':id(\\d+)/profile',
  alias:[{
    name: 'profile',
    path:'/profile',
  }],
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
      title: this.$tv('core.page-user.page_title.profile', 'Profile') as string,
    };
  },
  asyncData: async ({ route, error, redirect, graphqlClient }) => {
    if (route.params.id === userStore.id) {
      return redirect('/profile');
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
              metas(metaKeys: ["first_name", "last_name", "nick_name", "avator", "description"]) {
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
          user: Object.assign(
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
  user!: User & Partial<UserMetas>;

  data() {
    return {
      user: null,
    };
  }

  get isYourself() {
    return !this.$route.params.id;
  }

  render() {
    return (
      <a-card class="user-profile" bordered={false}>
        {/* Name */}
        <a-row gutter={[8, 8]}>
          <a-col xs={24} sm={{ span: 18, offset: 6 }}>
            <h1>{this.$tv('core.page-user.form.group_name', 'Name')}</h1>
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.username', 'Username')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.username}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.firstname', 'First Name')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.firstName}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.lastname', 'Last Name')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.lastName}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.nickname', 'Nickname')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.nickName}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.display_name', 'Display name for public as')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.displayName}
          </a-col>
        </a-row>
        {/* Contact Info */}
        <a-row gutter={[8, 8]}>
          <a-col xs={24} sm={{ span: 18, offset: 6 }}>
            <h1>{this.$tv('core.page-user.form.group_contact_info', 'Contact Info')}</h1>
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.email', 'Email')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.email}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.website', 'Website')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.url}
          </a-col>
        </a-row>
        {/* About Yourself */}
        <a-row gutter={[8, 8]}>
          <a-col xs={24} sm={{ span: 18, offset: 6 }}>
            <h1>{this.$tv('core.page-user.form.group_about_yourself', 'About Yourself')}</h1>
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong style="line-height:64px">{this.$tv('core.page-user.form.avator', 'Profile Picture')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.avatar ? (
              <a-avatar size={64} url={this.user.avatar}></a-avatar>
            ) : (
              <a-avatar size={64} icon="user" />
            )}
          </a-col>
        </a-row>
        <a-row gutter={[8, 24]}>
          <a-col xs={8} sm={6} class={classes.itemLabel}>
            <strong>{this.$tv('core.page-user.form.description', 'Biographical Info')}: </strong>
          </a-col>
          <a-col xs={16} sm={18}>
            {this.user.description}
          </a-col>
        </a-row>
        {this.isYourself ? (
          <a-row gutter={[8, 24]}>
            <a-col xs={24} sm={{ span: 18, offset: 6 }}>
              <a-button
                type="primary"
                title={this.$tv('core.page-user.btn_tips.edit_profile', 'Edit Profile')}
                onClick={() => this.$router.push({ name: 'profile-edit' })}
              >
                {this.$tv('core.page-user.btn_text.edit_profile', 'Edit Profile')}
              </a-button>
            </a-col>
          </a-row>
        ) : null}
      </a-card>
    );
  }
}
