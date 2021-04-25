import { OptionAutoload } from '@/common/helpers/enums';
import { OptionAttributes, OptionCreationAttributes } from '@/orm-entities/interfaces/options.interface';

export interface OptionModel extends OptionAttributes {}

export interface OptionArgs {
  autoload?: OptionAutoload;
}

export interface NewOptionInput extends Omit<OptionCreationAttributes, 'id'> {}

export class UpdateOptionInput {
  optionValue?: string;
  autoload?: OptionAutoload;
}
