/**
 * 用户角色（包含null）
 * none 在数据库表现形式为空
 * todo: enum union type
 */
export enum UserRoleWithNone {
  Administrator = 'administrator',
  Editor = 'editor',
  Author = 'author',
  Contributor = 'contributor',
  Subscriber = 'subscriber',
  None = 'none',
}
