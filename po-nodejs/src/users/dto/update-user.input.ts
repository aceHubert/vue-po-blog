import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { UserRole, UserRoleWithNone } from '../enums';
import { NewUserInput } from './new-user.input';

@InputType({ description: 'Update user input' })
export class UpdateUserInput extends PartialType(
  PickType(NewUserInput, ['loginPwd', 'email', 'mobile', 'firstName', 'lastName', 'url', 'status', 'locale'] as const),
) {
  @Field({ description: 'Display name' })
  displayName!: string;

  @Field({ description: 'Nick name' })
  nickName!: string;

  @Field((type) => String, { nullable: true, description: 'Description' })
  description?: string;

  @Field((type) => UserRoleWithNone, {
    nullable: true,
    description: 'User role（include "None", only "Administrator" role is allowed to update this field）',
  })
  userRole?: UserRole | 'none';
}
