import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OptionAutoload } from '../enums';

@ObjectType({ description: 'Option model' })
export class Option {
  @Field(() => ID, { description: 'Option id' })
  id!: number;

  @Field({ description: 'Option name' })
  optionName!: string;

  @Field({ description: 'Option name' })
  optionValue!: string;

  @Field((type) => OptionAutoload, { description: 'Autoload at the front-end apps' })
  autoload!: OptionAutoload;
}
