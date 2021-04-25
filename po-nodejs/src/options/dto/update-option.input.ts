import { Field, InputType } from '@nestjs/graphql';
import { OptionAutoload } from '../enums';

@InputType({ description: 'Update option input' })
export class UpdateOptionInput {
  @Field({ nullable: true, description: 'Option value' })
  optionValue?: string;

  @Field((type) => OptionAutoload, { nullable: true, description: 'Autoload at the front-end apps' })
  autoload?: OptionAutoload;
}
