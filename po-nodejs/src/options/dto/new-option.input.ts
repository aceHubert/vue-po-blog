import { Field, InputType } from '@nestjs/graphql';
import { OptionAutoload } from '../enums';

@InputType({ description: 'New option inpupt' })
export class NewOptionInput {
  @Field({ description: 'Name' })
  optionName!: string;

  @Field({ description: 'Value' })
  optionValue!: string;

  @Field((type) => OptionAutoload, {
    nullable: true,
    defaultValue: OptionAutoload.No,
    description: 'Autoload at the front-end apps (default: no)',
  })
  autoload?: OptionAutoload;
}
