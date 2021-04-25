import { OptionAutoload } from '@/options/enums';
import { OptionAttributes, OptionCreationAttributes } from '@/orm-entities/interfaces/options.interface';

export interface OptionModel extends OptionAttributes {}

export interface OptionArgs {
  autoload?: OptionAutoload;
}

export interface NewOptionInput extends Pick<OptionCreationAttributes, 'optionName' | 'optionValue' | 'autoload'> {}

export class UpdateOptionInput {
  optionValue?: string;
  autoload?: OptionAutoload;
}
