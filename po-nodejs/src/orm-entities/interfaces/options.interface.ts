import { Optional } from './optional.interface';
import { OptionAutoload } from '@/options/enums';

export interface OptionAttributes {
  id: number;
  optionName: string;
  optionValue: string;
  autoload: OptionAutoload;
}

export interface OptionCreationAttributes extends Optional<OptionAttributes, 'id' | 'autoload'> {}
