import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { NewUserMetaInput as INewUserMetaInput } from '@/sequelize-datasources/interfaces';

@InputType({ description: '用户元数据新建模型' })
export class NewUserMetaInput extends NewMetaInput implements INewUserMetaInput {
  @Field(() => ID, { description: 'User Id' })
  userId!: number;
}
