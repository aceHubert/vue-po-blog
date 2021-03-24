import { Optional } from './optional.interface';

export interface TermAttributes {
  id: number;
  name: string;
  slug: string;
  group: number;
}

export interface TermCreationAttributes extends Optional<TermAttributes, 'id' | 'group'> {}
