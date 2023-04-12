import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

// Types
import { NewUserMetaInput as INewUserMetaInput } from '@/sequelize-datasources/interfaces';

@InputType({ description: 'New user meta input' })
export class NewUserMetaInput extends NewMetaInput implements INewUserMetaInput {
  @Field(() => ID, { description: 'User id' })
  userId!: number;
}
