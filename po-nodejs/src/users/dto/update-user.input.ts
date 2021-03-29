import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { UserRole } from '@/common/helpers/enums';
import { NewUserInput } from './new-user.input';

// todo: enum union type
export enum UserRoleWithNone {
  Administrator = 'administrator',
  Editor = 'editor',
  Author = 'author',
  Contributor = 'contributor',
  Subscriber = 'subscriber',
  None = 'none',
}

@InputType({ description: '用户修改模型' })
export class UpdateUserInput extends PartialType(
  PickType(NewUserInput, ['loginPwd', 'email', 'mobile', 'firstName', 'lastName', 'url', 'status', 'locale'] as const),
) {
  @Field({ description: '显示名称' })
  displayName!: string;

  @Field({ description: '别名' })
  nickName!: string;

  @Field((type) => String, { nullable: true, description: '描述' })
  description?: string;

  @Field((type) => UserRoleWithNone, { nullable: true, description: '角色（包含 none）' })
  userRole?: UserRole | 'none';
}
