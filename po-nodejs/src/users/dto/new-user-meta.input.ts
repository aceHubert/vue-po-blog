import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { UserMetaCreationAttributes } from '@/orm-entities/interfaces/user-meta.interface';

@InputType({ description: '用户元数据新建模型' })
export class NewUserMetaInput extends NewMetaInput implements UserMetaCreationAttributes {
  @Field(() => ID, { description: 'User Id' })
  userId!: number;
}
